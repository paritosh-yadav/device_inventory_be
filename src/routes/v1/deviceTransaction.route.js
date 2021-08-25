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
  )
  .get(
    auth('manageDeviceTransactions'),
    validate(deviceTransactionValidation.getDeviceTransactions),
    deviceTransactionController.getDeviceTransactions
  );

router
  .route('/:transactionId')
  .get(
    auth('manageDeviceTransactions'),
    validate(deviceTransactionValidation.getDeviceTransaction),
    deviceTransactionController.getDeviceTransaction
  )
  .patch(
    auth('manageDeviceTransactions'),
    validate(deviceTransactionValidation.updateDeviceTransaction),
    deviceTransactionController.updateDeviceTransaction
  )
  .delete(
    auth('deleteDeviceTransactions'),
    validate(deviceTransactionValidation.deleteDeviceTransaction),
    deviceTransactionController.deleteDeviceTransaction
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
 *    get:
 *      summary: Get all device transactions
 *      description: All users can get the device transactions.
 *      tags: [Device Transactions]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: deviceId
 *          schema:
 *            type: string
 *          description: Device identifier
 *        - in: query
 *          name: userId
 *          schema:
 *            type: string
 *          description: User identifier
 *        - in: query
 *          name: sortBy
 *          schema:
 *            type: string
 *          description: sort by query in the form of field:desc/asc (ex. deviceId:asc)
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *          default: 10
 *          description: Maximum number of transactions
 *        - in: query
 *          name: page
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *          description: Page number
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  results:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/DeviceTransactions'
 *                  page:
 *                    type: integer
 *                    example: 1
 *                  limit:
 *                    type: integer
 *                    example: 10
 *                  totalPages:
 *                    type: integer
 *                    example: 1
 *                  totalResults:
 *                    type: integer
 *                    example: 1
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 *  /deviceTransactions/{id}:
 *    get:
 *      summary: Get a transaction
 *      description: Transaction details will be provided based on unique id.
 *      tags: [Device Transactions]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: transaction id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/DeviceTransactions'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a transaction
 *      description: Transaction details will be updated.
 *      tags: [Device Transactions]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: transaction id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                dueDate:
 *                  type: string
 *                  description: must be valid date
 *              example:
 *                dueDate: 2021-06-16T15:16:56.348Z
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/DeviceTransactions'
 *        "400":
 *          $ref: '#/components/responses/FutureDuedateOnly'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a transaction
 *      description: Transaction will be deleted.
 *      tags: [Device Transactions]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Transaction id
 *      responses:
 *        "200":
 *          description: No content
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
