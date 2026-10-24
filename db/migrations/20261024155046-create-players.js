'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      player_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'game_sessions', key: 'session_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nickname: { type: Sequelize.STRING(50), allowNull: false },
      player_token_hash: { type: Sequelize.STRING(255), allowNull: false },
      token_expires_at: { type: Sequelize.DATE, allowNull: false },
      shelf_position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('players', {
      type: 'unique',
      name: 'uq_players_session_user',
      fields: ['session_id', 'user_id'],
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('players');
  },
};