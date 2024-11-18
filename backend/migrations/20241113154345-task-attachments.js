'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_attachments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tasks', // Assuming you have a 'tasks' table
          key: 'id'
        },
        onDelete: 'CASCADE' // When a task is deleted, its attachments will also be deleted
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      flag: {
        type: Sequelize.ENUM('0', '1', '2'), // ENUM values
        allowNull: false,
        defaultValue: '0' // Default flag to '0' (Task Creator)
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_attachments');
  }
};
