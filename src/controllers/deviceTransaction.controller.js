const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const { status } = require('../config/transaction');
const { deviceStatusesList } = require('../config/deviceStatus');
const { deviceTransactionService, deviceService, userService } = require('../services');

const createDeviceTransaction = catchAsync(async (req, res) => {
  const deviceTransaction = await deviceTransactionService.createDeviceTransaction(req.body);
  await deviceService.updateDeviceById(req.body.deviceId, { deviceStatus: deviceStatusesList.BOOKING_PENDING });
  res.status(httpStatus.CREATED).send(deviceTransaction);
});

const getDeviceTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['deviceId', 'userId', 'status']);
  if (filter.status) {
    filter.status = { $in: filter.status.replace(/ /g, '').split(',') };
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const devices = await deviceTransactionService.getDeviceTransactions(filter, options);
  res.send(devices);
});

const getDeviceTransaction = catchAsync(async (req, res) => {
  let deviceTransaction = await deviceTransactionService.getTransactionById(req.params.transactionId);
  if (!deviceTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device transaction not found');
  }
  const user = await userService.getUserById(deviceTransaction.userId);
  const device = await deviceService.getDeviceById(deviceTransaction.deviceId);
  deviceTransaction = {
    ...deviceTransaction.toJSON(),
    device,
    userName: user.name,
  };
  res.send(deviceTransaction);
});

const updateDeviceTransaction = catchAsync(async (req, res) => {
  const deviceTransaction = await deviceTransactionService.updateDeviceTransactionById(
    req.params.transactionId,
    req.body.status === status.CLOSED
      ? {
          ...req.body,
          submittedOn: Date.now(),
        }
      : req.body
  );
  const deviceUsedInTransaction = await deviceTransactionService.getTransactionById(req.params.transactionId);
  let updatedDeviceStatus;
  if (req.body.status === status.CLOSED) {
    updatedDeviceStatus = deviceStatusesList.AVAILABLE;
  } else if (req.body.status === status.OPEN) {
    updatedDeviceStatus = deviceStatusesList.BOOKED;
  } else if (req.body.status === status.SUBMISSION_HOLD) {
    updatedDeviceStatus = deviceStatusesList.SUBMISSION_PENDING;
  }
  await deviceService.updateDeviceById(deviceUsedInTransaction.deviceId, {
    deviceStatus: updatedDeviceStatus,
  });
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
