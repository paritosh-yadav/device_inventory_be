const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const deviceSchema = new mongoose.Schema(
  {
    modalName: {
      type: String,
      required: true,
      trim: true,
    },
    srNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    uuid: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    variant: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    isIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

deviceSchema.plugin(toJSON);
deviceSchema.plugin(paginate);

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
