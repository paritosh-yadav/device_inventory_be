const mongoose = require('mongoose');
const faker = require('faker');
const DeviceTransaction = require('../../src/models/deviceTransaction.model');
const Device = require('../../src/models/device.model');

const mockDeviceTransaction = (deviceId, userId) => ({
  _id: mongoose.Types.ObjectId(),
  deviceId,
  userId,
  dueDate: faker.datatype.datetime(),
});

const createDevicesTransaction = async (transactions) => {
  await DeviceTransaction.insertMany(transactions.map((transaction) => ({ ...transaction })));
  const device = await Device.findById(transactions[0].deviceId);
  Object.assign(device, { isIssued: true });
  await device.save();
};
module.exports = { mockDeviceTransaction, createDevicesTransaction };
