'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks', // Reference to the tasks table
          key: 'id', // Referencing the 'id' column in the tasks table
        },
        onDelete: 'CASCADE', // Deletes this comment if the associated task is deleted
      },
      comment: {
        type: Sequelize.TEXT('long'), // LONGTEXT for even longer content
        allowNull: false, // Ensures that a comment must be provided
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false, // The user ID who created the comment
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Sets default to the current date/time
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Sets default to the current date/time
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comments');
  }
};
