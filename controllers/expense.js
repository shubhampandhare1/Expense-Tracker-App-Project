const Expense = require('../models/expense');
const sequelize = require('../util/db');

exports.getExpense = async (req, res, next) => {
    try {
        const pagesize = +req.query.pagesize;
        const page = +req.query.page || 1;

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
            throw new Error('Expense not found')
        }
        const expenseDel = await Expense.findAll({ where: { id: expenseId, userId: req.user.id } })
        const amount = expenseDel[0].dataValues.amount;
        const data = await Expense.destroy({ where: { id: expenseId, userId: req.user.id } }, { transaction: t });
        if (data == 0) {
            throw new Error('Expense not found')
        }
        const updateTotalExpense = req.user.totalExpense - amount;
        await req.user.update({ totalExpense: updateTotalExpense }, { transaction: t });
        await t.commit();
        res.status(200).json({ res: data, messege: 'expense deleted successfully' });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ err: error, message: 'expense not found' });
    }
}

exports.editExpense = async (req, res, next) => {
    try{
        const id = req.params.id;
        const {amount, description, category} = req.body;
        const expense = await Expense.findOne({ where: { id: id, userId: req.user.id } });
    
        if(expense){
            await expense.update({
                amount: amount,
                description: description,
                category: category,
            })
    
            res.status(200).json({message:'Expense Updated Successfully'})
        }
        else{
            throw new Error('Error at update expense controller')
        }
    }
    catch(error){
        res.status(404).json({message:'Expense Not found'});
    }
}