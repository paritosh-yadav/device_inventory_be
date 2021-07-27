const mongoose = require('mongoose');
const faker = require('faker');
const request = require('supertest');
const httpStatus = require('http-status');
const setupTestDB = require('../utils/setupTestDB');

const { insertUsers, userOne, admin } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const app = require('../../src/app');
const { Device, DeviceTransaction } = require('../../src/models');

setupTestDB();

describe('Device transaction route', () => {
  describe('POST /v1/deviceTransactions', () => {
    let newTransaction;
    let newDevice;
    beforeEach(async () => {
      newDevice = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.alpha(),
        manufacturer: faker.random.alpha(),
      };
      newTransaction = {
        userId: mongoose.Types.ObjectId(),
        dueDate: faker.datatype.datetime(),
      };

      await insertUsers([userOne]);
      await insertUsers([admin]);
    });

    test('Should return 201 and successfully create new deviceTransaction if data is ok', async () => {
      const deviceRes = await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.CREATED);
      newTransaction.deviceId = new mongoose.Types.ObjectId(deviceRes.body.id);
      const res = await request(app)
        .post('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTransaction)
        .expect(httpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.anything(),
        deviceId: newTransaction.deviceId.toString(),
        userId: newTransaction.userId.toString(),
        issuedOn: expect.anything(),
        dueDate: new Date(newTransaction.dueDate).toISOString(),
        submittedOn: null,
      });

      const dbDeviceTransaction = await DeviceTransaction.findById(res.body.id);
      expect(dbDeviceTransaction).toBeDefined();

      expect(dbDeviceTransaction).toMatchObject({
        deviceId: newTransaction.deviceId,
        userId: newTransaction.userId,
        dueDate: newTransaction.dueDate,
        id: res.body.id,
        issuedOn: new Date(res.body.issuedOn),
        submittedOn: null,
      });

      // If device's "isIssued" has been set to "true" or not
      const dbDevice = await Device.findById(deviceRes.body.id);
      expect(dbDevice).toBeDefined();
      expect(dbDevice.isIssued).toBe(true);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/deviceTransactions').send(newTransaction).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if deviceId is not a valid mongoose objectId', async () => {
      newTransaction.deviceId = 'invalidId';
      await request(app)
        .post('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTransaction)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if userId is not a valid mongoose objectId', async () => {
      newTransaction.userId = 'invalidId';
      await request(app)
        .post('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTransaction)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if dueDate is not a valid Date', async () => {
      newTransaction.dueDate = 'invalidDate';
      await request(app)
        .post('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTransaction)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if deviceId is already booked', async () => {
      const deviceRes = await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.CREATED);
      newTransaction.deviceId = new mongoose.Types.ObjectId(deviceRes.body.id);
      await request(app)
        .post('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTransaction)
        .expect(httpStatus.CREATED);
      await request(app)
        .post('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTransaction)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
