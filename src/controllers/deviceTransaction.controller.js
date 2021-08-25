const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
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

const getDeviceTransaction = catchAsync(async (req, res) => {
  const deviceTransaction = await deviceTransactionService.getTransactionById(req.params.transactionId);
  if (!deviceTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device transaction not found');
  }
  res.send(deviceTransaction);
});

const updateDeviceTransaction = catchAsync(async (req, res) => {
  let deviceTransaction;
  if (req.body.status === 'Closed') {
    deviceTransaction = await deviceTransactionService.updateDeviceTransactionById(req.params.transactionId, {
      ...req.body,
      submittedOn: Date.now(),
    });
    const device = await deviceTransactionService.getTransactionById(req.params.transactionId);
    await deviceService.updateDeviceById(device.deviceId, { isIssued: false });
  } else {
    deviceTransaction = await deviceTransactionService.updateDeviceTransactionById(req.params.transactionId, req.body);
  }
  res.send(deviceTransaction);
});

const deleteDeviceTransaction = catchAsync(async (req, res) => {
  await deviceTransactionService.deleteDeviceTransactionById(req.params.transactionId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createDeviceTransaction,
  getDeviceTransactions,
  getDeviceTransaction,
  updateDeviceTransaction,
  deleteDeviceTransaction,
};
