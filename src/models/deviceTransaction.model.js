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
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

deviceTransactionSchema.plugin(toJSON);

const DeviceTransaction = mongoose.model('DeviceTransaction', deviceTransactionSchema);

module.exports = DeviceTransaction;
