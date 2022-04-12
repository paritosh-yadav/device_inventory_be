const httpStatus = require('http-status');
const { aasaService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const FILE_NAME = 'apple-app-site-association';
const getAASAFile = catchAsync(async (req, res, next) => {
  const aasaFile = await aasaService.getAASA();
  res.sendFile(FILE_NAME, aasaFile, (err) => {
    if (err) {
      next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
    }
  });
});
module.exports = {
  getAASAFile,
};
