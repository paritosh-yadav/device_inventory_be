const httpStatus = require('http-status');
const { Device } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Add a device
 * @param {Object} deviceBody
 * @returns {Promise<Device>}
 */
const addDevice = async (deviceBody) => {
  try {
    const device = await Device.create(deviceBody);
    return device;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

/**
 * Query for devices
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getDevices = async (filter, options) => {
  const devices = await Device.paginate(filter, options);
  return devices;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<Device>}
 */
const getDeviceById = async (id) => {
  return Device.findById(id);
};

/**
 * Update device by id
 * @param {ObjectId} deviceId
 * @param {Object} updateBody
 * @returns {Promise<Device>}
 */

const updateDeviceById = async (deviceId, updateBody) => {
  const device = await getDeviceById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }
  if (updateBody.srNo && (await Device.isSrNoTaken(updateBody.srNo))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Serial Number already taken');
  }
  if (updateBody.uuid && (await Device.isUuidTaken(updateBody.uuid))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'UUID already taken');
  }
  Object.assign(device, updateBody);
  await device.save();
  return device;
};

/**
 * Delete device by id
 * @param {ObjectId} deviceId
 * @returns {Promise<Device>}
 */
const deleteDeviceById = async (deviceId) => {
  const device = await getDeviceById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }
  await device.remove();
  return device;
};

module.exports = {
  addDevice,
  getDevices,
  getDeviceById,
  updateDeviceById,
  deleteDeviceById,
};
