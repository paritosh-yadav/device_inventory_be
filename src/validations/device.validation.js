const joi = require('joi');
const { objectId } = require('./custom.validation');

const addDevice = {
  body: joi.object().keys({
    modalName: joi.string().required(),
    srNo: joi.string().required(),
    uuid: joi.string().required(),
    variant: joi.string().required(),
    category: joi.string().required(),
    manufacturer: joi.string().required(),
    picture: joi.string().uri(),
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

const getDevice = {
  params: joi.object().keys({
    deviceId: joi.string().custom(objectId),
  }),
};

const updateDevice = {
  params: joi.object().keys({
    deviceId: joi.string().custom(objectId),
  }),
  body: joi
    .object()
    .keys({
      modalName: joi.string().alphanum(),
      srNo: joi.string().alphanum(),
      uuid: joi.string().alphanum(),
      variant: joi.string().alphanum(),
      category: joi.string().regex(/^[A-Za-z]+$/),
      manufacturer: joi.string().regex(/^[A-Za-z\s]+$/),
      picture: joi.string().uri(),
      isIssued: joi.boolean(),
    })
    .min(1),
};

const deleteDevice = {
  params: joi.object().keys({
    deviceId: joi.string().custom(objectId),
  }),
};
module.exports = {
  addDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
};
