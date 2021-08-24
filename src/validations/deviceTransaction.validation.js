const joi = require('joi');
const { objectId } = require('./custom.validation');

const createDeviceTransaction = {
  body: joi.object().keys({
    deviceId: joi.string().custom(objectId),
    userId: joi.string().custom(objectId),
    dueDate: joi.date().iso(),
  }),
};

const getDeviceTransactions = {
  query: joi.object().keys({
    deviceId: joi.string().custom(objectId),
    userId: joi.string().custom(objectId),
    sortBy: joi.string(),
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

const getDeviceTransaction = {
  params: joi.object().keys({
    transactionId: joi.string().custom(objectId),
  }),
};

const deleteDeviceTransaction = {
  params: joi.object().keys({
    transactionId: joi.string().custom(objectId),
  }),
};

module.exports = { createDeviceTransaction, getDeviceTransactions, getDeviceTransaction, deleteDeviceTransaction };
