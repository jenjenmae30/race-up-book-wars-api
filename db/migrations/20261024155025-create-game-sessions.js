'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_sessions', {
      session_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      host_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      set_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'question_sets', key: 'set_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      join_code: { type: Sequelize.STRING(6), allowNull: false, unique: true },
      status: { type: Sequelize.STRING(20), allowNull: true, defaultValue: 'WAITING' },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      started_at: { type: Sequelize.DATE, allowNull: true },
      time_limit_sec: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      ended_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('game_sessions');
  },
};