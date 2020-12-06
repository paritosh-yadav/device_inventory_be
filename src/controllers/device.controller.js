const httpStatus = require('http-status');
const { deviceService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const addDevice = catchAsync(async (req, res) => {
  const device = await deviceService.addDevice(req.body);
  res.status(httpStatus.CREATED).send(device);
});

module.exports = {
  addDevice,
};
