const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetPasswordUrl = `https://device-inventory.herokuapp.com/reset-password/${token}`;
  const html = `
  <head>
  <style>
    div {
      display:flex;
      align-items: center;
    }
  </style>
  </head>
  <p>Dear user,</p>
  <div>
  <p>To reset your password, click on</p>
  <form action=${resetPasswordUrl} method="get">
    <input type=submit value=ResetPassword />
  </form>
  </div>
  <p>If you did not request any password resets, then ignore this email.</p>
  `;
  await sendEmail(to, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
};
