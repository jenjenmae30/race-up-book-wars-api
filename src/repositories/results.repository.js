const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT
      s.join_code AS session_code,
      s.started_at,
      s.ended_at,
      u.school_id,
      p.nickname,
      COALESCE(latest_score.score, 0)::integer AS score,
      (
        totals.total_questions > 0
        AND COALESCE(progress.completed_questions, 0) = totals.total_questions
      ) AS completed
    FROM game_sessions AS s
    JOIN players AS p
      ON p.session_id = s.session_id
    JOIN users AS u
      ON u.user_id = p.user_id
    CROSS JOIN LATERAL (
      SELECT COUNT(*)::integer AS total_questions
      FROM questions AS q
      WHERE q.set_id = s.set_id
    ) AS totals
    LEFT JOIN LATERAL (
      SELECT COUNT(*) FILTER (
        WHERE pqp.completed_at IS NOT NULL
      )::integer AS completed_questions
      FROM questions AS q
      LEFT JOIN player_question_progress AS pqp
        ON pqp.question_id = q.question_id
       AND pqp.player_id = p.player_id
      WHERE q.set_id = s.set_id
    ) AS progress ON true
    LEFT JOIN LATERAL (
      SELECT l.score
      FROM leaderboard AS l
      WHERE l.player_id = p.player_id
      ORDER BY l.achieved_at DESC, l.entry_id DESC
      LIMIT 1
    ) AS latest_score ON true
    WHERE s.status = 'CLOSED'
      AND s.ended_at IS NOT NULL
      AND (
        CAST(:since AS timestamptz) IS NULL
        OR s.ended_at > CAST(:since AS timestamptz)
      )
    ORDER BY s.ended_at, score DESC
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      since: since ? since.toISOString() : null,
    },
  });
}

module.exports = { findFinishedGamePlayers };