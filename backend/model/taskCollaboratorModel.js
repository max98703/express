const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('./baseModel');
const User = require('./userLogin'); // Assuming User model exists

class TaskCollaborator extends Model {}

TaskCollaborator.init({
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  collaborator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
}, {
  sequelize,
  modelName: 'TaskCollaborator',
  tableName: 'task_collaborators',
  underscored: true,
  timestamps: false,
});

// Associations
TaskCollaborator.belongsTo(User, {
  foreignKey: 'collaborator_id',
  as: 'user', // Alias for the related collaborator (user)
});


module.exports = TaskCollaborator;
