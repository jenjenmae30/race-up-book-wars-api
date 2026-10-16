'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_sessions', {
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      host_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'game_users', key: 'user_id' },
        onDelete: 'CASCADE',
      },
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'set_id' },
        onDelete: 'CASCADE',
      },
      join_code: {
        type: Sequelize.STRING(6),
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'WAITING',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      time_limit_sec: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('game_sessions');
  },
};
