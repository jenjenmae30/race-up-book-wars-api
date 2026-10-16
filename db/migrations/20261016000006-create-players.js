'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'game_sessions', key: 'session_id' },
        onDelete: 'CASCADE',
      },
      nickname: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      player_token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      token_expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      shelf_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('players');
  },
};
