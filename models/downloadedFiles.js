const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const DownloadedFiles = sequelize.define('downloadedFiles', {
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    fileUrl:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    userId: Sequelize.INTEGER,
    date: Sequelize.DATEONLY,
})

module.exports = DownloadedFiles;