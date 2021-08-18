const DeviceTransaction = require('../../src/models/deviceTransaction.model');
const Device = require('../../src/models/device.model');

const createDevicesTransaction = async (transactions) => {
  await DeviceTransaction.insertMany(transactions.map((transaction) => ({ ...transaction })));
  const device = await Device.findById(transactions[0].deviceId);
  Object.assign(device, { isIssued: true });
  await device.save();
};
module.exports = { createDevicesTransaction };
