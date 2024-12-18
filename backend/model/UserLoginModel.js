const { Sequelize, sequelize } = require('./baseModel');

const UserLogin = sequelize.define('user_Login', {
    id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.CHAR(36),  
        allowNull: false
    },
    logged_out: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    logged_in_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
    logged_out_at: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    ip_address: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    token_id: {
        type: Sequelize.STRING(255),  
        allowNull: true
    },
    token_secret: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    token_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    device: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    indexes: [
        { fields: ['user_id', 'token_id'], unique: true }
    ],
    tableName: 'user_Login',
    timestamps: false,  // Adds 'createdAt' and 'updatedAt'
    paranoid: false,    // Adds 'deletedAt' for soft deletes
});

module.exports = UserLogin;
