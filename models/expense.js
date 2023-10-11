const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const Expense = sequelize.define('expenses', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    },
    amount: Sequelize.INTEGER,
    description: Sequelize.STRING,
    category: Sequelize.STRING,
    date: Sequelize.DATEONLY,
})

module.exports = Expense;