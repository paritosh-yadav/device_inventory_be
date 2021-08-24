const httpStatus = require('http-status');
const { DeviceTransaction } = require('../models');
const { getDeviceById } = require('./device.service');
const ApiError = require('../utils/ApiError');
/**
 * Add a device
 * @param {Object} deviceBody
 * @returns {Promise<DeviceTransaction>}
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

/**
 * Get transaction by id
 * @param {ObjectId} id
 * @returns {Promise<Device>}
 */
const getTransactionById = async (id) => {
  return DeviceTransaction.findById(id);
};

/**
 * Get transaction by deviceId to check booked device & users who haven't submitted them.
 * @param {ObjectId} id
 * @returns {Promise<DeviceTransaction>}
 */
const getTransactionByDeviceId = async (id) => {
  return DeviceTransaction.findOne({ deviceId: id, submittedOn: null });
};

/**
 * Query for deviceTransactions
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getDeviceTransactions = async (filter, options) => {
  const deviceTranasctions = await DeviceTransaction.paginate(filter, options);
  return deviceTranasctions;
};

/**
 * Delete deviceTransaction by id
 * @param {ObjectId} transactionId
 * @returns {Promise<Device>}
 */
const deleteDeviceTransactionById = async (transactionId) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  if (!transaction.submittedOn) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Device hasn't submitted yet");
  }
  await transaction.remove();
  return transaction;
};

module.exports = {
  createDeviceTransaction,
  getDeviceTransactions,
  getTransactionById,
  getTransactionByDeviceId,
  deleteDeviceTransactionById,
};
