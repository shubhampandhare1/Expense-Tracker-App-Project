const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/db");

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