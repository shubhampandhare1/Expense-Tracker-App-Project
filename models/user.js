const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    totalExpense: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    isPremiumUser: Sequelize.BOOLEAN,
})

module.exports = User;