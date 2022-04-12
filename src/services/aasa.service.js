const path = require('path');
/**
 * Fetch AASA file for iOS universal deep linking
 * @returns {Promise<Object>}
 */
const getAASA = () => {
  const PATH = path.join(__dirname, `../../AASA`);
  const options = {
    root: PATH,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      'Content-Type': 'application/json',
    },
  };
  return options;
};

module.exports = {
  getAASA,
};
