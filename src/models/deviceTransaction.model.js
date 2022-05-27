const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { status } = require('../config/transaction');

const deviceTransactionSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Device',
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
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
    status: {
      type: String,
      validate(value) {
        if (
          value !== status.OPEN &&
          value !== status.CLOSED &&
          value !== status.BOOKING_HOLD &&
          value !== status.SUBMISSION_HOLD
        ) {
          throw new Error(
            `Status can't be other than '${status.OPEN}' or '${status.CLOSED}' or '${status.BOOKING_HOLD}' or '${status.SUBMISSION_HOLD}'`
          );
        }
      },
      enum: [status.OPEN, status.CLOSED, status.BOOKING_HOLD, status.SUBMISSION_HOLD],
      default: status.BOOKING_HOLD,
    },
  },
  {
    timestamps: true,
  }
);

deviceTransactionSchema.plugin(toJSON);
deviceTransactionSchema.plugin(paginate);

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
