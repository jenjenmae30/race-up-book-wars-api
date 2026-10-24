'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nickname: { type: Sequelize.STRING(50), allowNull: false },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      school_id: { type: Sequelize.STRING(20), allowNull: false },
      full_name: { type: Sequelize.STRING(80), allowNull: false },
      email: { type: Sequelize.STRING(254), allowNull: false },
      role: { type: Sequelize.STRING(24), allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    for (const [name, field] of [
      ['uq_users_nickname', 'nickname'],
      ['uq_users_school_id', 'school_id'],
      ['uq_users_email', 'email'],
    ]) {
      await queryInterface.addConstraint('users', {
        type: 'unique',
        name,
        fields: [field],
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};