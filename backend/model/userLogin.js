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
        allowNull: false,
    },
    created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    token_version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,  // Default to 1 for new records
        allowNull: false
    },
     // New fields for 2FA
     twoFactorSecret: {
        type: Sequelize.STRING,
        allowNull: true, // Allow null initially, as 2FA may not be enabled
    },
    twoFactorEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // 2FA is disabled by default
        allowNull: false,
    },
    otp: {
        type: Sequelize.STRING,
        allowNull: true, // Allow null, OTP will be generated only if 2FA is enabled
      },
      otp_created_at: {
        type: Sequelize.DATE,
        allowNull: true, // Allow null until OTP is generated
      },
}, {
    tableName: 'users',
    timestamps: false,  // Adds 'createdAt' and 'updatedAt'
    paranoid: false,    // Adds 'deletedAt' for soft deletes
});

module.exports = User;