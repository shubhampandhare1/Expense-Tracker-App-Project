const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense')

router.get('/get-expense', expenseController.getExpense);
router.post('/add-expense', expenseController.addExpense);
router.delete('/delete-expense/:id', expenseController.deleteExpense);

module.exports = router;