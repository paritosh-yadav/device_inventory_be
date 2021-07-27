const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const deviceTransactionSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    issuedOn: {
      type: Date,
      default: Date.now(),
    },
    dueDate: {
      type: Date,
      required: true,
    },
    submittedOn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

deviceTransactionSchema.plugin(toJSON);

/**
 * Check if deviceId is already booked
 * @param {string} deviceId - The device's id
 * @returns {Promise<boolean>}
 */
deviceTransactionSchema.statics.isDeviceBooked = async function (deviceId) {
  const device = await this.findOne({ deviceId });
  return !!device;
};

const DeviceTransaction = mongoose.model('DeviceTransaction', deviceTransactionSchema);

module.exports = DeviceTransaction;
