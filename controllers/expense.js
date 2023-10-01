const Expense = require('../models/expense');

exports.getExpense = async (req, res, next) => {
    try {

        const expenses = await Expense.findAll();
        res.status(200).json({ expenses });

    } 
    catch (error) {
        res.status(404).json({ err });
    }
}

exports.addExpense = async (req, res, next) => {
    try {
        const { amount, description, category } = req.body;

        const newExpense = await Expense.create({
            amount,
            description,
            category
        })

        res.status(200).json({ newExpense });
    }
    catch (err) {
        res.status(500).json({err});
    }
}

exports.deleteExpense = async (req, res, next) => {
    try {
        const delId = req.params.id;
        const delExp = await Expense.findByPk(delId);

        if(!delExp){
            res.status(404).json({message:'expense not found'})
        }

        await delExp.destroy();
        res.status(200).json({messege: 'expense deleted successfully'});
    }
    catch (error) {
        res.status(500).json({error});
    }
}