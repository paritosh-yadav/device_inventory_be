const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const deviceRoute = require('./device.route');
const deviceTransaction = require('./deviceTransaction.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/docs', docsRoute);
router.use('/devices', deviceRoute);
router.use('/deviceTransactions', deviceTransaction);

module.exports = router;
