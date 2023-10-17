const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/db");
const AWS = require('aws-sdk');
const DownloadedFiles = require('../models/downloadedFiles');

function uploadToS3(data, filename) {

    let s3Bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET
    })

    let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    }
    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3response) => {  //async
            if (err) {
                console.log('Something Went Wrong', err);
                reject(err)
            } else {
                resolve(s3response.Location);
            }
        })
    })
}

exports.downloadExpense = async (req, res, next) => {
    try {
        if (!req.user.isPremiumUser) {
            return res.status(401).json({ message: 'Buy Premium to Download Report', success: false })
        }
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user.id;

        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, filename);
        await req.user.createDownloadedFile({
            fileUrl: fileUrl,
            date: sequelize.literal('CURDATE()'),
        })
        res.status(200).json({ url: fileUrl, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ url: '', success: false, error: err });
    }
}

exports.recentlyDownloadedFiles = async (req, res, next) => {
    try {
        const recentdownloadedfiles = await DownloadedFiles.findAll({ where: { userId: req.user.id } });
        res.status(200).json(recentdownloadedfiles)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.showLeaderboard = async (req, res, next) => {
    try {
        const leaderboardofUsers = await User.findAll({
            order: [[('totalExpense'), 'DESC']]
        })
        res.status(200).json(leaderboardofUsers);
    } catch (error) {
        console.log(error);
    }
}

