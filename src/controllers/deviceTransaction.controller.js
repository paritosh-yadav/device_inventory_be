const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { deviceTransactionService, deviceService } = require('../services');

const createDeviceTransaction = catchAsync(async (req, res) => {
  const deviceTransaction = await deviceTransactionService.createDeviceTransaction(req.body);
  await deviceService.updateDeviceById(req.body.deviceId, { isIssued: true });
  res.status(httpStatus.CREATED).send(deviceTransaction);
});

module.exports = {
  createDeviceTransaction,
};
