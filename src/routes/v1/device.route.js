const express = require('express');
const deviceController = require('../../controllers/device.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const deviceValidation = require('../../validations/device.validation');

const router = express.Router();

router
  .route('/')
  .post(auth('addDevice'), validate(deviceValidation.addDevice), deviceController.addDevice)
  .get(auth('getDevices'), validate(deviceValidation.getDevices), deviceController.getDevices);

router
  .route('/:deviceId')
  .get(auth('getDevices'), validate(deviceValidation.getDevice), deviceController.getDevice)
  .patch(auth('updateDevice'), validate(deviceValidation.updateDevice), deviceController.updateDevice)
  .delete(auth('deleteDevice'), validate(deviceValidation.deleteDevice), deviceController.deleteDevice);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device CRUDs
 */

/**
 * @swagger
 *  /devices:
 *    post:
 *      summary: Add a device
 *      description: Only admins can add devices.
 *      tags: [Devices]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - modalName
 *                - srNo
 *                - uuid
 *                - variant
 *                - category
 *                - manufacturer
 *                - picture
 *              properties:
 *                modalName:
 *                  type: string
 *                  description: must be alphanumeric
 *                srNo:
 *                  type: string
 *                  description: must be unique alphanumeric
 *                uuid:
 *                  type: string
 *                  description: must be unique alphanumeric
 *                variant:
 *                  type: string
 *                  description: must be alphanumeric
 *                category:
 *                  type: string
 *                  description: must be alphabets only
 *                manufacturer:
 *                  type: string
 *                  description: must be alphabets only
 *                picture:
 *                  type: string
 *                  description: (Optional) must be a valid url
 *              example:
 *                modalName: iPhone 12
 *                srNo: device_serial_number
 *                uuid: device_uuid
 *                variant: 128GB
 *                category: Mobile
 *                manufacturer: Apple
 *                picture: http://placeimg.com/640/480,
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Device'
 *        "400":
 *          $ref: '#/components/responses/DuplicateSrNo'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *    get:
 *      summary: Get all devices
 *      description: All users can get the devices.
 *      tags: [Devices]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: query
 *          name: modalName
 *          schema:
 *            type: string
 *          description: Device modal name
 *        - in: query
 *          name: isIssued
 *          schema:
 *            type: boolean
 *            enum: [true, false]
 *            example: true
 *          description: Devices status
 *        - in: query
 *          name: sortBy
 *          schema:
 *            type: string
 *          description: sort by query in the form of field:desc/asc (ex. modalName:asc)
 *        - in: query
 *          name: limit
 *          schema:
 *            type: integer
 *            minimum: 1
 *          default: 10
 *          description: Maximum number of devices
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
 *                      $ref: '#/components/schemas/Device'
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
 *  /devices/{id}:
 *    get:
 *      summary: Get a device
 *      description: Device details will be provided based on unique id.
 *      tags: [Devices]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: device id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Device'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a device
 *      description: Device details will be updated.
 *      tags: [Devices]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Device id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                modalName:
 *                  type: string
 *                  description: must be alphanumeric
 *                srNo:
 *                  type: string
 *                  description: must be unique alphanumeric
 *                uuid:
 *                  type: string
 *                  description: must be unique alphanumeric
 *                variant:
 *                  type: string
 *                  description: must be alphanumeric
 *                category:
 *                  type: string
 *                  description: must be alphabets only
 *                manufacturer:
 *                  type: string
 *                  description: must be alphabets only
 *                picture:
 *                  type: string
 *                  description: (Optional) must be a vaild url
 *                isIssued:
 *                   type: boolean
 *              example:
 *                modalName: iPhone 12
 *                srNo: 123dadda1
 *                uuid: asdasd231323
 *                variant: 128GB
 *                category: Mobile
 *                manufacturer: Apple
 *                picture: http://placeimg.com/640/480,
 *                isIssued: true
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Device'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a device
 *      description: Device will be deleted.
 *      tags: [Devices]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Device id
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
