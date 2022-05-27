const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const { deviceStatusesList } = require('../config/deviceStatus');

const deviceSchema = new mongoose.Schema(
  {
    modalName: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        // Blacklisting the '' (space), as its not part of isAlpha
        if (!validator.isAlphanumeric(validator.blacklist(value, ' '))) {
          throw new Error('Modal name should be alphanumeric');
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
        if (!validator.isAlpha(validator.blacklist(value, ' '))) {
          throw new Error('Manufacturer name should conatin only alphabets');
        }
      },
    },
    picture: {
      type: String,
      default: null,
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error('Picture should be a valid url');
        }
      },
    },
    deviceStatus: {
      type: String,
      default: deviceStatusesList.AVAILABLE,
    },
  },
  {
    timestamps: true,
  }
);

deviceSchema.plugin(toJSON);
deviceSchema.plugin(paginate);

/**
 * Check if srNo is taken
 * @param {string} srNo - The device's srNo
 * @returns {Promise<boolean>}
 */
deviceSchema.statics.isSrNoTaken = async function (srNo) {
  const device = await this.findOne({ srNo });
  return !!device;
};

/**
 * Check if uuid is taken
 * @param {string} uuid - The device's uuid
 * @returns {Promise<boolean>}
 */
deviceSchema.statics.isUuidTaken = async function (uuid) {
  const device = await this.findOne({ uuid });
  return !!device;
};

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
