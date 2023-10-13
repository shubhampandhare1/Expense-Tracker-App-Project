const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense');
const userAuthenticate = require('../middleware/auth')

router.get('/get-expense', userAuthenticate.authenticate, expenseController.getExpense);
router.post('/add-expense', userAuthenticate.authenticate, expenseController.addExpense);
router.delete('/delete-expense/:id', userAuthenticate.authenticate, expenseController.deleteExpense);

router.get('/download', userAuthenticate.authenticate, expenseController.downloadExpense);
router.get('/recentdownload', userAuthenticate.authenticate, expenseController.recentlyDownloadedFiles);


module.exports = router;