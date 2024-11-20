const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');
const User = require('./userLogin'); // Assuming you have the User model defined elsewhere
const TaskCollaborator = require('./taskCollaboratorModel'); // Assuming this model exists
const TaskAttachment = require('./attachmentModel');
class Task extends Model {}

Task.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',  // Maps the `createdBy` property to `created_by` in the database
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
},
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  underscored: true,
});

// Associations
Task.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator', // Alias for the associated User (creator)
  onDelete: 'SET NULL', // Ensures task stays even if user is deleted
});

// Define the hasMany relationship with TaskCollaborator
Task.hasMany(TaskCollaborator, {
  foreignKey: 'task_id',
  as: 'collaborators', // Alias to refer to collaborators for each task
  onDelete: 'CASCADE', // Ensures that collaborators are removed if the task is deleted
});

// Task model (task.js)
Task.hasMany(TaskAttachment, { foreignKey: 'task_id', as: 'attachments' }); // Alias should be 'attachments'
TaskAttachment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' }); // Corresponding 'as' alias in Attachment model


// Export the Task model
module.exports = Task;
