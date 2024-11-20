const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');

class TaskAttachment extends Model {}

TaskAttachment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Tasks', // References the 'tasks' table
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // References the 'users' table
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  flag: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'TaskAttachment',
  tableName: 'task_attachments',
  timestamps: false,
  underscored: true,
});


module.exports = TaskAttachment;
