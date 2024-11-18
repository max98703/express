// model/projectModel.js
const { Model, DataTypes } = require('sequelize');
const {  sequelize } = require('./baseModel'); 
const Task = require('./taskModel'); // Import Task model to define associations

class Project extends Model {}

Project.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects',
  underscored: true,
});

// Define associations
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

module.exports = Project;
