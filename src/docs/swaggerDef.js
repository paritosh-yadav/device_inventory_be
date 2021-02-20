const { version } = require('../../package.json');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Device Inventory API documentation',
    version,
  },
  servers: [
    {
      url: `https://device-inventory.herokuapp.com/v1`,
    },
  ],
};

module.exports = swaggerDef;
