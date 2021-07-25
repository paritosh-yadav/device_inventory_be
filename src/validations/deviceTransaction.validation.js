const joi = require('joi');
const { objectId } = require('./custom.validation');

const createDeviceTransaction = {
  body: joi.object().keys({
    deviceId: joi.string().custom(objectId),
    userId: joi.string().custom(objectId),
    dueDate: joi.date().iso(),
  }),
};

module.exports = { createDeviceTransaction };
