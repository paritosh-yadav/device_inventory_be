const httpStatus = require('http-status');
const { deviceService, deviceTransactionService, userService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { deviceStatusesList } = require('../config/deviceStatus');

const addDevice = catchAsync(async (req, res) => {
  const device = await deviceService.addDevice(req.body);
  res.status(httpStatus.CREATED).send(device);
});

const getDevices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['modalName', 'deviceStatus']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const devices = await deviceService.getDevices(filter, options);
  res.send(devices);
});

const getDevice = catchAsync(async (req, res) => {
  let device = await deviceService.getDeviceById(req.params.deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }
  // Fetching transaction if device is not available, hence attaching usedId to response
  if (device.deviceStatus !== deviceStatusesList.AVAILABLE) {
    const deviceTransaction = await deviceTransactionService.getUnclosedTransactionByDeviceId(req.params.deviceId);
    const user = await userService.getUserById(deviceTransaction.userId);
    device = {
      ...device.toJSON(),
      transactionId: deviceTransaction._id,
      dueDate: deviceTransaction.dueDate,
      userId: deviceTransaction.userId,
      userName: user.name,
    };
  }
  res.send(device);
});

const updateDevice = catchAsync(async (req, res) => {
  const device = await deviceService.updateDeviceById(req.params.deviceId, req.body);
  res.send(device);
});

const deleteDevice = catchAsync(async (req, res) => {
  await deviceService.deleteDeviceById(req.params.deviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  addDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
};
