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

module.exports = {
  addDevice,
};
