const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');
const User = require('./userLogin'); // Assuming the User model exists
const Task = require('./taskModel'); // Assuming this model exists

class TaskLog extends Model {}

TaskLog.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'taskId', 
    },
    previousStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'previousStatus', // Maps to `previous_status`
    },
    currentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'currentStatus', // Maps to `current_status`
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field:'createdBy',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'TaskLog',
    tableName: 'task_status_logs',
    underscored: true,
    timestamps: false, // Prevent Sequelize from adding `createdAt` and `updatedAt` automatically
  }
);

// Associations
TaskLog.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
  onDelete: 'SET NULL', // Set to NULL if the associated user is deleted
});

TaskLog.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task',
  onDelete: 'CASCADE', // Delete associated collaborators when a task log is deleted
});

module.exports = TaskLog;
