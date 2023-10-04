const Expense = require('../models/expense');

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
    try {
        const { amount, description, category } = req.body;
        const newExpense = await req.user.createExpense({
            amount,
            description,
            category,
        })

        res.status(200).json({ newExpense });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;

        if (!expenseId) {
            res.status(404).json({ message: 'expense not found' })
        }

        const data = await Expense.destroy({ where: { id: expenseId, userId: req.user.id } });
        if (data == 0) {
            return res.status(404).json({ success: false, message: 'Expense belongs to someone else' })
        }
        res.status(200).json({ messege: 'expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}