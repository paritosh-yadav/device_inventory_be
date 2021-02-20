const httpStatus = require('http-status');
const { deviceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const addDevice = catchAsync(async (req, res) => {
  const device = await deviceService.addDevice(req.body);
  res.status(httpStatus.CREATED).send(device);
});

const getDevices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['modalName', 'isIssued']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const devices = await deviceService.getDevices(filter, options);
  res.send(devices);
});

module.exports = {
  addDevice,
  getDevices,
};
