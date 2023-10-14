const Expense = require('../models/expense');
const sequelize = require('../util/db');
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
            return res.status(401).json({ message: 'User is not a premium user', success: false })
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

exports.getExpense = async (req, res, next) => {
    try {
        const pagesize = +req.query.pagesize;
        const page = +req.query.page || 1;
        // const itemsPerPage = 10;
        
        const count = await Expense.count({ where: { userId: req.user.id } }) 
        const offset = (page - 1) * pagesize;
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            offset: offset,
            limit: pagesize,
        });
        res.status(200).json({
            expenses: expenses,
            currPage: page,
            hasNextPage: pagesize * page < count,
            nextPage: page + 1,
            hasPrevPage: page > 1,
            prevPage: page - 1,
            lastpage: Math.ceil(count / pagesize),
        });

    }
    catch (error) {
        res.status(404).json({ error });
    }
}

exports.addExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category, date } = req.body;
        const newExpense = await req.user.createExpense({
            amount,
            description,
            category,
            date
        }, { transaction: t })
        const totalExpense = Number(req.user.totalExpense) + Number(amount);

        await req.user.update({ totalExpense: totalExpense }, { transaction: t });
        await t.commit();
        res.status(200).json({ newExpense });
    }
    catch (err) {
        await t.rollback();
        res.status(500).json({ error: err });
    }
}

exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;

        if (!expenseId) {
            res.status(404).json({ message: 'expense not found' })
        }
        const expenseDel = await Expense.findAll({ where: { id: expenseId, userId: req.user.id } })
        const amount = expenseDel[0].dataValues.amount;
        const data = await Expense.destroy({ where: { id: expenseId, userId: req.user.id } }, { transaction: t });
        if (data == 0) {
            return res.status(404).json({ success: false, message: 'Expense belongs to someone else' })
        }
        const updateTotalExpense = req.user.totalExpense - amount;
        await req.user.update({ totalExpense: updateTotalExpense }, { transaction: t });
        await t.commit();
        res.status(200).json({ res: data, messege: 'expense deleted successfully' });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ err: error });
    }
}