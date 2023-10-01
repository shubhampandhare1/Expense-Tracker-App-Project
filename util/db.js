const Sequelize = require('sequelize');
const sequelize = new Sequelize('expense-tracker-app', 'root', 'Shubham@9767',
    {
        dialect: 'mysql',
        host: 'localhost',
    })

module.exports = sequelize;