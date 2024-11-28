const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("./baseModel");
const User = require("./userLogin"); // Assuming User model exists

class CommentCollaborator extends Model {}

CommentCollaborator.init(
  {
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    underscored: true,
    timestamps: false,
  }
);

// Associations
CommentCollaborator.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

module.exports = CommentCollaborator;
