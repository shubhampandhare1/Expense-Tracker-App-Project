const express = require('express');
const router = express.Router();
const userAuthenticate = require('../middleware/auth');
const premiumController = require('../controllers/premium');

router.get('/premiummembership', userAuthenticate.authenticate, premiumController.purchasePremium);

router.post('/updatetransactionstatus', userAuthenticate.authenticate, premiumController.updateTransactionStatus);

module.exports = router;