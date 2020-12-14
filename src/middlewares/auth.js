const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');
const { User } = require('../models');

const auth = (...requiredRights) => async (req, res, next) => {
  let decocedToken = null;
  try {
    if (!req.get('Authorization')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
    const token = req.get('Authorization').replace('Bearer ', '');
    try {
      decocedToken = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    if (decocedToken.type !== tokenTypes.ACCESS) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }
    const user = await User.findById(decocedToken.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
