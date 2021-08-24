const mongoose = require('mongoose');
const faker = require('faker');
const request = require('supertest');
const httpStatus = require('http-status');
const setupTestDB = require('../utils/setupTestDB');
const { insertDevices, mockDeviceOne, mockDeviceTwo } = require('../fixtures/device.fixture');
const {
  mockDeviceTransaction,
  createDevicesTransaction,
  deleteDeviceTransaction,
} = require('../fixtures/deviceTransaction.fixture');
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
        picture: faker.image.imageUrl(),
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
  describe('GET /v1/deviceTransactions', () => {
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertDevices([mockDeviceOne]);
    });
    test('should return 200 and apply the default query options', async () => {
      const deviceTransaction = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      await createDevicesTransaction([deviceTransaction]);
      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toMatchObject({
        id: deviceTransaction._id.toHexString(),
        deviceId: mockDeviceOne._id.toString(),
        userId: admin._id.toString(),
        dueDate: new Date(deviceTransaction.dueDate).toISOString(),
        submittedOn: null,
      });
    });
    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/deviceTransactions').send().expect(httpStatus.UNAUTHORIZED);
    });
    test('should correctly apply filter on deviceId field', async () => {
      await insertDevices([mockDeviceTwo]);
      await createDevicesTransaction([
        mockDeviceTransaction(mockDeviceOne._id, admin._id),
        mockDeviceTransaction(mockDeviceTwo._id, admin._id),
      ]);
      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ deviceId: mockDeviceOne._id.toHexString() })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].deviceId).toBe(mockDeviceOne._id.toHexString());
    });
    test('should correctly apply filter on userId field', async () => {
      await insertUsers([userOne]);
      await insertDevices([mockDeviceTwo]);
      await createDevicesTransaction([
        mockDeviceTransaction(mockDeviceOne._id, admin._id),
        mockDeviceTransaction(mockDeviceTwo._id, userOne._id),
      ]);
      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ userId: admin._id.toHexString() })
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].userId).toBe(admin._id.toHexString());
    });
    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertDevices([mockDeviceTwo]);
      const mockTransactionOne = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      const mockTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      await createDevicesTransaction([mockTransactionOne, mockTransactionTwo]);

      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'dueDate:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      const expectedOrder = [mockTransactionTwo, mockTransactionOne].sort((a, b) => (a.dueDate > b.dueDate ? -1 : 1));
      expectedOrder.forEach((transaction, index) => {
        expect(res.body.results[index].id).toBe(transaction._id.toHexString());
      });
    });
    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertDevices([mockDeviceTwo]);
      const mockTransactionOne = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      const mockTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      await createDevicesTransaction([mockTransactionOne, mockTransactionTwo]);

      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'dueDate:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      const expectedOrder = [mockTransactionTwo, mockTransactionOne].sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
      expectedOrder.forEach((transaction, index) => {
        expect(res.body.results[index].id).toBe(transaction._id.toHexString());
      });
    });
    test('should limit returned array if limit param is specified', async () => {
      await insertDevices([mockDeviceTwo]);
      const mockTransactionOne = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      const mockTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      await createDevicesTransaction([mockTransactionOne, mockTransactionTwo]);

      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 1,
        totalResults: 2,
      });

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(mockTransactionOne._id.toHexString());
      expect(res.body.results[1].id).toBe(mockTransactionTwo._id.toHexString());
    });
    test('should return the correct page if page and limit params are specified', async () => {
      await insertDevices([mockDeviceTwo]);
      const mockTransactionOne = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      const mockTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      await createDevicesTransaction([mockTransactionOne, mockTransactionTwo]);

      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 1, page: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });

      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(mockTransactionTwo._id.toHexString());
    });
  });

  describe('GET /v1/deviceTransactions/:transactionId', () => {
    let deviceTransaction;
    beforeEach(async () => {
      await insertUsers([userOne]);
      await insertDevices([mockDeviceOne]);
      deviceTransaction = mockDeviceTransaction(mockDeviceOne._id, userOne._id);
      await createDevicesTransaction([deviceTransaction]);
    });
    test('should return 200 and the transaction object if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toMatchObject({
        submittedOn: null,
        deviceId: deviceTransaction.deviceId.toHexString(),
        userId: deviceTransaction.userId.toHexString(),
        dueDate: deviceTransaction.dueDate.toISOString(),
        id: deviceTransaction._id.toHexString(),
      });
    });
    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/deviceTransactions/${deviceTransaction._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 400 error if transactionId is not a valid mongo id', async () => {
      await request(app)
        .get(`/v1/deviceTransactions/invaliddeviceid`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 404 error if transaction is not found', async () => {
      await insertDevices([mockDeviceTwo]);
      const deviceTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      await request(app)
        .get(`/v1/deviceTransactions/${deviceTransactionTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('Delete /v1/deviceTransactions/:transactionId', () => {
    let deviceTransaction;
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertDevices([mockDeviceOne]);
      deviceTransaction = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      deviceTransaction.submittedOn = faker.datatype.datetime();
      await createDevicesTransaction([deviceTransaction]);
    });
    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);
      await request(app)
        .delete(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
    test('should return 204 if device is submitted', async () => {
      await request(app)
        .delete(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      const dbDeviceTransactions = await DeviceTransaction.findById(deviceTransaction._id);
      expect(dbDeviceTransactions).toBeNull();
    });

    test('should return 400 if transaction is not closed', async () => {
      await insertDevices([mockDeviceTwo]);
      const deviceTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, admin._id);
      deviceTransactionTwo.submittedOn = null;
      await createDevicesTransaction([deviceTransactionTwo]);
      await request(app)
        .delete(`/v1/deviceTransactions/${deviceTransactionTwo._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/deviceTransactions/${deviceTransaction._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if deviceId is not a valid mongo id', async () => {
      await request(app)
        .delete('/v1/deviceTransactions/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if transaction not found', async () => {
      await deleteDeviceTransaction(deviceTransaction._id);
      await request(app)
        .delete(`/v1/devices/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
