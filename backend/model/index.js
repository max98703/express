// models/index.js
const { Sequelize, sequelize } = require('./baseModel');
const Project = require('./projectModel');
const Task = require('./taskModel');

// Initialize the models
const models = {
  Project,
  Task,
};

// Define associations
Project.associate(models);  // Call the associate method for Project
Task.associate(models);     // Call the associate method for Task

// Optionally, sync the models with the database
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.error("Error syncing the database:", err);
  });

module.exports = models; // Export the models to be used elsewhere
