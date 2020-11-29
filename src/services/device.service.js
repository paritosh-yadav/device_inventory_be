const httpStatus = require('http-status');
const { Device } = require('../models');
const ApiError = require('../utils/ApiError');

const addDevice = async (deviceBody) => {
  try {
    const device = await Device.create(deviceBody);
    return device;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  addDevice,
};
