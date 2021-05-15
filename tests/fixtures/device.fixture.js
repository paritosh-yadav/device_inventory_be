const mongoose = require('mongoose');
const faker = require('faker');
const Device = require('../../src/models/device.model');

const mockDeviceOne = {
  _id: mongoose.Types.ObjectId(),
  modalName: faker.random.alphaNumeric(),
  srNo: faker.random.alphaNumeric(),
  uuid: faker.random.alphaNumeric(),
  variant: faker.random.alphaNumeric(),
  category: faker.random.alpha(),
  manufacturer: faker.random.alpha(),
};

const mockDeviceTwo = {
  _id: mongoose.Types.ObjectId(),
  modalName: faker.random.alphaNumeric(),
  srNo: faker.random.alphaNumeric(),
  uuid: faker.random.alphaNumeric(),
  variant: faker.random.alphaNumeric(),
  category: faker.random.alpha(),
  manufacturer: faker.random.alpha(),
};

const insertDevices = async (devices) => {
  await Device.insertMany(devices.map((device) => ({ ...device })));
};
const deleteDevice = async (device) => {
  await Device.findOneAndDelete(device);
};

module.exports = { mockDeviceOne, mockDeviceTwo, insertDevices, deleteDevice };
