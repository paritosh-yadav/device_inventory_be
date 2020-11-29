const express = require('express');
const deviceController = require('../../controllers/device.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const deviceValidation = require('../../validations/device.validation');

const router = express.Router();

router.route('/').post(auth('manageDevices'), validate(deviceValidation.addDevice), deviceController.addDevice);

module.exports = router;
