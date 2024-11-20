'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('task_collaborators', {
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
          model: 'tasks', // Name of the tasks table
          key: 'id', // Referencing the 'id' column of the tasks table
        },
        onDelete: 'CASCADE', // Deletes this record if the associated task is deleted
      },
      collaborator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE', // Deletes this record if the associated user is deleted
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Set the default to the current date/time
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Set the default to the current date/time
      },
      flag: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true, // You can change this default value as per your requirement
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('task_collaborators');
  }
};
