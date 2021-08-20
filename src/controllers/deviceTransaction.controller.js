const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { deviceTransactionService, deviceService } = require('../services');

const createDeviceTransaction = catchAsync(async (req, res) => {
  const deviceTransaction = await deviceTransactionService.createDeviceTransaction(req.body);
  await deviceService.updateDeviceById(req.body.deviceId, { isIssued: true });
  res.status(httpStatus.CREATED).send(deviceTransaction);
});

const getDeviceTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['deviceId', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const devices = await deviceTransactionService.getDeviceTransactions(filter, options);
  res.send(devices);
});

module.exports = {
  createDeviceTransaction,
  getDeviceTransactions,
};
