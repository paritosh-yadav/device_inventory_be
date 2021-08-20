const joi = require('joi');
const { objectId } = require('./custom.validation');

const createDeviceTransaction = {
  body: joi.object().keys({
    deviceId: joi.string().custom(objectId),
    userId: joi.string().custom(objectId),
    dueDate: joi.date().iso(),
  }),
};

const getDeviceTransaction = {
  query: joi.object().keys({
    deviceId: joi.string().custom(objectId),
    userId: joi.string().custom(objectId),
    sortBy: joi.string(),
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

module.exports = { createDeviceTransaction, getDeviceTransaction };
