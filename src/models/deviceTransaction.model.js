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
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    submittedOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

deviceTransactionSchema.plugin(toJSON);

const DeviceTransaction = mongoose.model('DeviceTransaction', deviceTransactionSchema);

module.exports = DeviceTransaction;
