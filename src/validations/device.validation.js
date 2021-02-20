const joi = require('joi');

const addDevice = {
  body: joi.object().keys({
    modalName: joi.string().required(),
    srNo: joi.string().required(),
    uuid: joi.string().required(),
    variant: joi.string().required(),
    category: joi.string().required(),
    manufacturer: joi.string().required(),
    isIssued: joi.boolean(),
  }),
};

const getDevices = {
  query: joi.object().keys({
    modalName: joi.string(),
    isIssued: joi.boolean(),
    sortBy: joi.string(),
    limit: joi.number().integer(),
    page: joi.number().integer(),
  }),
};

module.exports = {
  addDevice,
  getDevices,
};
