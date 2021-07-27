const httpStatus = require('http-status');
const { DeviceTransaction } = require('../models');
const { getDeviceById } = require('./device.service');
const ApiError = require('../utils/ApiError');
/**
 * Add a device
 * @param {Object} deviceBody
 * @returns {Promise<Device>}
 */

const createDeviceTransaction = async (deviceTransactionBody) => {
  try {
    const device = await getDeviceById(deviceTransactionBody.deviceId);
    if (device.isIssued)
      if (deviceTransactionBody.deviceId && (await DeviceTransaction.isDeviceBooked(deviceTransactionBody.deviceId))) {
        throw new Error('This device already booked.');
      }
    const deviceTransaction = await DeviceTransaction.create(deviceTransactionBody);
    return deviceTransaction;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

module.exports = {
  createDeviceTransaction,
};
