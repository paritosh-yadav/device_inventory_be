const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const deviceTransactionValidation = require('../../validations/deviceTransaction.validation');
const deviceTransactionController = require('../../controllers/deviceTransaction.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageDeviceTransactions'),
    validate(deviceTransactionValidation.createDeviceTransaction),
    deviceTransactionController.createDeviceTransaction
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Device Transactions
 *   description: Device Transaction CRUDs
 */

/**
 * @swagger
 *  /deviceTransactions:
 *    post:
 *      summary: Book a device
 *      description: All users can book device.
 *      tags: [Device Transactions]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - deviceId
 *                - userId
 *                - dueDate
 *              properties:
 *                deviceId:
 *                  type: string
 *                  description: must be a valid mongoose objectId
 *                userId:
 *                  type: string
 *                  description: must be a valid mongoose objectId
 *                dueDate:
 *                  type: date
 *                  description: must be a valid date
 *              example:
 *                deviceId: "5fdcbc30a0e5c50e540016cd"
 *                userId: "5fc2790af6a6bbc45afba0d6"
 *                dueDate: "2021-06-05T15:16:54.348Z"
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/DeviceTransactions'
 *        "400":
 *          $ref: '#/components/responses/DeviceAlreadyBooked'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
