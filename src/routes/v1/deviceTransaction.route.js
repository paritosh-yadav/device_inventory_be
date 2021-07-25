const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const deviceTransactionValidation = require('../../validations/deviceTransaction.validation');
const deviceTransactionController = require('../../controllers/deviceTransaction.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageDeviceTransactions'),
    validate(deviceTransactionValidation.createDeviceTransaction),
    deviceTransactionController.createDeviceTransaction
  );

module.exports = router;
