'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('book_effects', {
      book_effect_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      effect_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      effect_value: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('book_effects');
  },
};
