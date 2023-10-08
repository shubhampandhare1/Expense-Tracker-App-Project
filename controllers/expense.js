const Expense = require('../models/expense');
const sequelize = require('../util/db');

exports.getExpense = async (req, res, next) => {
    try {

        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json({ expenses });

    }
    catch (error) {
        res.status(404).json({ error });
    }
}

exports.addExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category } = req.body;
        const newExpense = await req.user.createExpense({
            amount,
            description,
            category,
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