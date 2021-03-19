const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const deviceSchema = new mongoose.Schema(
  {
    modalName: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        // Blacklisting the '' (space), as its not part of isAlpha
        if (!validator.isAlpha(validator.blacklist(value, ' '))) {
          throw new Error('Modal name should conatin only alphabets');
        }
      },
    },
    srNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isAlphanumeric(value)) {
          throw new Error('Serial Number should be alphanumeric');
        }
      },
    },
    uuid: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isAlphanumeric(value)) {
          throw new Error('UUID should be alphanumeric');
        }
      },
    },
    variant: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isAlphanumeric(value)) {
          throw new Error('Variant should be alphanumeric');
        }
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error('Category should conatin only alphabets');
        }
      },
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error('Manufacturer name should conatin only alphabets');
        }
      },
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
