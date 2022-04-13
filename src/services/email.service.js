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
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `https://device-inventory.herokuapp.com/reset-password/${token}`;
  // const text = `Dear user,
  // To reset your password, click on this link: ${resetPasswordUrl}
  // If you did not request any password resets, then ignore this email.`;

  const html = `
  <p>Dear user,</p>
  <p>To reset your password, click on this <a href="${resetPasswordUrl}">link:</a></p>
  <form action="https://device-inventory.herokuapp.com/reset-password/${token}" method="get">
    <input type=submit value=Final />
  </form>
  <form action=${resetPasswordUrl} method="get">
    <input type=submit value=ResetPassword />
  </form>
  <button onclick="myFunction()">Redirect</button>
  <p>If you did not request any password resets, then ignore this email.</p>
  
  <script>
  function myFunction() {
  window.location.href = "${resetPasswordUrl}";
  }
  </script>`;
  await sendEmail(to, subject, html);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
};
