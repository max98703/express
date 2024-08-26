const { Sequelize, sequelize } = require('./baseModel'); 
const User = sequelize.define('User', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true, // Allow null for users logging in via Google
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true, // Allow null if no token is provided
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    googleLogin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    logo: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'users',
    timestamps: false,  // Adds 'createdAt' and 'updatedAt'
    paranoid: false,    // Adds 'deletedAt' for soft deletes
});

module.exports = User;