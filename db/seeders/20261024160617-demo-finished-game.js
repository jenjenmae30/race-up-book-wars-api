'use strict';

const crypto = require('crypto');

const HOST_EMAIL = 'host@raceup.test';
const PLAYER_EMAILS = [
  'aster@raceup.test',
  'basil@raceup.test',
  'cora@raceup.test',
  'dune@raceup.test',
];
const SET_TITLE = 'Race Up Demo Set';
const QUESTION_TEXT = 'Which section of a book lists its chapters?';
const JOIN_CODE = '581204';
const EFFECT_TYPE = 'DEMO_TIME_BONUS';

module.exports = {
  async up(queryInterface, Sequelize) {
    const select = (sql, replacements) =>
      queryInterface.sequelize.query(sql, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      });

    // Find user IDs; don't type generated IDs into seed data.
    const [host] = await select(
      'SELECT user_id FROM users WHERE email = :email',
      { email: HOST_EMAIL }
    );
    if (!host) throw new Error('Run the demo-users seeder first.');

    const users = await select(
      'SELECT user_id, email FROM users WHERE email IN (:emails)',
      { emails: PLAYER_EMAILS }
    );
    const userIdByEmail = Object.fromEntries(
      users.map((user) => [user.email, user.user_id])
    );
    if (PLAYER_EMAILS.some((email) => !userIdByEmail[email])) {
      throw new Error('One or more demo player accounts are missing.');
    }

    // Create the question set and look up its generated ID.
    await queryInterface.bulkInsert('question_sets', [{
      title: SET_TITLE,
      description: 'Fictional demo question set.',
      subject: 'Reading',
      grade_level: 'College',
    }]);

    const [questionSet] = await select(
      'SELECT set_id FROM question_sets WHERE title = :title',
      { title: SET_TITLE }
    );

    // Choices are stored as JSONB on the question.
    const choices = [
      'Table of contents',
      'Index',
      'Glossary',
      'Appendix',
    ];

    await queryInterface.bulkInsert('questions', [{
      set_id: questionSet.set_id,
      text: QUESTION_TEXT,
      type: 'multiple_choice',
      choices: JSON.stringify(choices),
      correct_index: 0,
      time_limit_sec: 30,
      difficulty: 'MEDIUM',
    }]);

    const [question] = await select(
      `SELECT question_id FROM questions
       WHERE set_id = :setId AND text = :questionText`,
      { setId: questionSet.set_id, questionText: QUESTION_TEXT }
    );

    const startedAt = new Date('2026-10-01T09:00:00Z');
    const endedAt = new Date('2026-10-01T09:06:00Z');

    await queryInterface.bulkInsert('game_sessions', [{
      host_user_id: host.user_id,
      set_id: questionSet.set_id,
      join_code: JOIN_CODE,
      status: 'CLOSED',
      created_at: startedAt,
      started_at: startedAt,
      time_limit_sec: 30,
      ended_at: endedAt,
    }]);

    const [session] = await select(
      'SELECT session_id FROM game_sessions WHERE join_code = :joinCode',
      { joinCode: JOIN_CODE }
    );

    // Three players completed the question; Dune left early.
    const playerSpecs = [
      { email: 'aster@raceup.test', nickname: 'Aster', shelf: 5 },
      { email: 'basil@raceup.test', nickname: 'Basil', shelf: 5 },
      { email: 'cora@raceup.test', nickname: 'Cora', shelf: 4 },
      { email: 'dune@raceup.test', nickname: 'Dune', shelf: 2 },
    ];

    const tokenExpiresAt = new Date('2026-10-02T09:00:00Z');
    const tokenHash = (nickname) =>
      crypto.createHash('sha256').update(`demo-token-${nickname}`).digest('hex');

    await queryInterface.bulkInsert(
      'players',
      playerSpecs.map((player) => ({
        session_id: session.session_id,
        user_id: userIdByEmail[player.email],
        nickname: player.nickname,
        player_token_hash: tokenHash(player.nickname),
        token_expires_at: tokenExpiresAt,
        shelf_position: player.shelf,
        joined_at: startedAt,
      }))
    );

    const players = await select(
      `SELECT player_id, nickname FROM players
       WHERE session_id = :sessionId`,
      { sessionId: session.session_id }
    );
    const playerIdByNickname = Object.fromEntries(
      players.map((player) => [player.nickname, player.player_id])
    );

    await queryInterface.bulkInsert('player_question_progress', [
      {
        player_id: playerIdByNickname.Aster,
        question_id: question.question_id,
        status: 'COMPLETED',
        attempts: 1,
        completed_at: endedAt,
      },
      {
        player_id: playerIdByNickname.Basil,
        question_id: question.question_id,
        status: 'COMPLETED',
        attempts: 2,
        completed_at: endedAt,
      },
      {
        player_id: playerIdByNickname.Cora,
        question_id: question.question_id,
        status: 'COMPLETED',
        attempts: 1,
        completed_at: endedAt,
      },
      {
        player_id: playerIdByNickname.Dune,
        question_id: question.question_id,
        status: 'UNANSWERED',
        attempts: 0,
        completed_at: null,
      },
    ]);

    await queryInterface.bulkInsert('answers', [
      {
        player_id: playerIdByNickname.Aster,
        question_id: question.question_id,
        choices_index: 0,
        is_correct: true,
        answered_at: startedAt,
      },
      {
        player_id: playerIdByNickname.Basil,
        question_id: question.question_id,
        choices_index: 1,
        is_correct: false,
        answered_at: startedAt,
      },
      {
        player_id: playerIdByNickname.Cora,
        question_id: question.question_id,
        choices_index: 0,
        is_correct: true,
        answered_at: startedAt,
      },
    ]);

    // Aster and Basil tie; Dune is ranked last and left early.
    await queryInterface.bulkInsert('leaderboard', [
      {
        player_id: playerIdByNickname.Aster,
        score: 100,
        rank_position: 1,
        achieved_at: endedAt,
      },
      {
        player_id: playerIdByNickname.Basil,
        score: 100,
        rank_position: 1,
        achieved_at: endedAt,
      },
      {
        player_id: playerIdByNickname.Cora,
        score: 80,
        rank_position: 3,
        achieved_at: endedAt,
      },
      {
        player_id: playerIdByNickname.Dune,
        score: 20,
        rank_position: 4,
        achieved_at: endedAt,
      },
    ]);

    await queryInterface.bulkInsert('retry_pool', [{
      player_id: playerIdByNickname.Dune,
      question_id: question.question_id,
      added_at: endedAt,
    }]);

    await queryInterface.bulkInsert('book_effects', [{
      effect_type: EFFECT_TYPE,
      effect_value: 15,
    }]);
  },

  async down(queryInterface) {
    const replacements = {
      joinCode: JOIN_CODE,
      setTitle: SET_TITLE,
      questionText: QUESTION_TEXT,
      effectType: EFFECT_TYPE,
    };

    await queryInterface.sequelize.query(`
      DELETE FROM "player_question_progress"
      WHERE "player_id" IN (
        SELECT "player_id" FROM "players"
        WHERE "session_id" = (
          SELECT "session_id" FROM "game_sessions" WHERE "join_code" = :joinCode
        )
      )
    `, { replacements });

    await queryInterface.sequelize.query(`
      DELETE FROM "answers"
      WHERE "player_id" IN (
        SELECT "player_id" FROM "players"
        WHERE "session_id" = (
          SELECT "session_id" FROM "game_sessions" WHERE "join_code" = :joinCode
        )
      )
    `, { replacements });

    await queryInterface.sequelize.query(`
      DELETE FROM "leaderboard"
      WHERE "player_id" IN (
        SELECT "player_id" FROM "players"
        WHERE "session_id" = (
          SELECT "session_id" FROM "game_sessions" WHERE "join_code" = :joinCode
        )
      )
    `, { replacements });

    await queryInterface.sequelize.query(`
      DELETE FROM "retry_pool"
      WHERE "player_id" IN (
        SELECT "player_id" FROM "players"
        WHERE "session_id" = (
          SELECT "session_id" FROM "game_sessions" WHERE "join_code" = :joinCode
        )
      )
    `, { replacements });

    await queryInterface.bulkDelete('players', {
      session_id: queryInterface.sequelize.literal(
        `(SELECT session_id FROM game_sessions WHERE join_code = '${JOIN_CODE}')`
      ),
    }, {});

    await queryInterface.bulkDelete('game_sessions', { join_code: JOIN_CODE }, {});

    await queryInterface.sequelize.query(`
      DELETE FROM "questions"
      WHERE "set_id" = (
        SELECT "set_id" FROM "question_sets" WHERE "title" = :setTitle
      )
      AND "text" = :questionText
    `, { replacements });

    await queryInterface.bulkDelete(
      'question_sets',
      { title: SET_TITLE },
      {}
    );

    await queryInterface.bulkDelete(
      'book_effects',
      { effect_type: EFFECT_TYPE },
      {}
    );
  },
};