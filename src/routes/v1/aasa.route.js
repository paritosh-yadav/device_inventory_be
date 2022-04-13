const express = require('express');
const { aasaController } = require('../../controllers');

const router = express.Router();

router.route('/apple-app-site-association').get(aasaController.getAASAFile);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: AASA
 *   description: apple-app-site-association File for Deeplink
 */

/**
 * @swagger
 *  /apple-app-site-association:
 *    get:
 *      summary: Get apple-app-site-association file
 *      description: This file is used for universal deeplink in iOS.
 *      tags: [AASA]
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  applinks:
 *                    type: object
 *                    properties:
 *                      apps:
 *                        type: array
 *                        description: app names
 *                        items: []
 *                      details:
 *                        type: array
 *                        items:
 *                          $ref: '#/components/schemas/AASA'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */
