const express = require('express');
const router = express.Router();
const userAuthenticate = require('../middleware/auth');
const leaderboardController = require('../controllers/premiumFeature');

router.get('/showleaderboard', userAuthenticate.authenticate,leaderboardController.showLeaderboard);

module.exports = router;