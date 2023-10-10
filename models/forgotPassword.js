const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const Forgotpassword = sequelize.define('forgotpassword',{
    id:{
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey : true,
    },
    userId: Sequelize.INTEGER,
    isActive: Sequelize.BOOLEAN,
})

module.exports = Forgotpassword;