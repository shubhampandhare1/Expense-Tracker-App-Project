const Expense = require("../models/expense");
const User = require("../models/user");

exports.showLeaderboard = async (req, res, next) => {
    try {
        const users = await User.findAll();
        const expenses = await Expense.findAll();
        const userAggregatedExpenses = {};
        expenses.forEach((expense) => {
            if (userAggregatedExpenses[expense.userId]) {
                userAggregatedExpenses[expense.userId] += expense.amount;
            }
            else {
                userAggregatedExpenses[expense.userId] = expense.amount;
            }
        })
        let userLeaderBoardDetails = [];
        users.forEach(user => {
            userLeaderBoardDetails.push({ name: user.name, totalExpense: userAggregatedExpenses[user.id] || 0 })
        })
        userLeaderBoardDetails.sort((a, b) => b.totalExpense - a.totalExpense)
        res.status(200).json(userLeaderBoardDetails);
    } catch (error) {
        console.log(error);
    }
}