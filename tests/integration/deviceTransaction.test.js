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
const { status } = require('../../src/config/transaction');
const { deviceStatusesList } = require('../../src/config/deviceStatus');

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
        dueDate: faker.date.future(),
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
        status: status.BOOKING_HOLD,
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

      // If device's "deviceStatus" has been set to "booking-pending" or not
      const dbDevice = await Device.findById(deviceRes.body.id);
      expect(dbDevice).toBeDefined();
      expect(dbDevice.deviceStatus).toBe(deviceStatusesList.BOOKING_PENDING);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/deviceTransactions').send(newTransaction).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if transactionId is not a valid mongoose objectId', async () => {
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
    test('should return 400 error if dueDate is of same/back_date', async () => {
      await insertDevices([mockDeviceOne]);
      newTransaction.deviceId = mockDeviceOne._id;
      newTransaction.dueDate = faker.date.past();
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
        deviceId: {
          id: mockDeviceOne._id.toString(),
          modalName: mockDeviceOne.modalName,
          srNo: mockDeviceOne.srNo,
          uuid: mockDeviceOne.uuid,
          variant: mockDeviceOne.variant,
          category: mockDeviceOne.category,
          manufacturer: mockDeviceOne.manufacturer,
          picture: mockDeviceOne.picture,
        },
        userId: {
          id: admin._id.toString(),
          name: admin.name,
        },
        dueDate: new Date(deviceTransaction.dueDate).toISOString(),
        submittedOn: null,
        status: status.BOOKING_HOLD,
      });
    });
    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/deviceTransactions').send().expect(httpStatus.UNAUTHORIZED);
    });
    test('should correctly apply filter on deviceId field', async () => {
      await insertDevices([mockDeviceTwo]);
      const mockDeviceTransactionOne = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      const mockDeviceTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, admin._id);
      await createDevicesTransaction([mockDeviceTransactionOne, mockDeviceTransactionTwo]);
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
      expect(res.body.results[0]).toStrictEqual({
        id: mockDeviceTransactionOne._id.toHexString(),
        deviceId: {
          id: mockDeviceOne._id.toString(),
          modalName: mockDeviceOne.modalName,
          srNo: mockDeviceOne.srNo,
          uuid: mockDeviceOne.uuid,
          variant: mockDeviceOne.variant,
          category: mockDeviceOne.category,
          manufacturer: mockDeviceOne.manufacturer,
          picture: mockDeviceOne.picture,
        },
        userId: {
          id: admin._id.toString(),
          name: admin.name,
        },
        issuedOn: expect.anything(),
        dueDate: new Date(mockDeviceTransactionOne.dueDate).toISOString(),
        submittedOn: null,
        status: status.BOOKING_HOLD,
      });
    });
    test('should correctly apply filter on userId field', async () => {
      await insertUsers([userOne]);
      await insertDevices([mockDeviceTwo]);
      const mockDeviceTransactionOne = mockDeviceTransaction(mockDeviceOne._id, admin._id);
      const mockDeviceTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      await createDevicesTransaction([mockDeviceTransactionOne, mockDeviceTransactionTwo]);
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
      expect(res.body.results[0]).toStrictEqual({
        id: mockDeviceTransactionOne._id.toHexString(),
        deviceId: {
          id: mockDeviceOne._id.toString(),
          modalName: mockDeviceOne.modalName,
          srNo: mockDeviceOne.srNo,
          uuid: mockDeviceOne.uuid,
          variant: mockDeviceOne.variant,
          category: mockDeviceOne.category,
          manufacturer: mockDeviceOne.manufacturer,
          picture: mockDeviceOne.picture,
        },
        userId: {
          id: admin._id.toString(),
          name: admin.name,
        },
        issuedOn: expect.anything(),
        dueDate: expect.anything(),
        submittedOn: null,
        status: status.BOOKING_HOLD,
      });
    });
    test('should correctly apply filter on status field', async () => {
      await insertDevices([mockDeviceTwo]);
      let modifiedMockTransaction = mockDeviceTransaction(mockDeviceTwo._id, admin._id);
      modifiedMockTransaction = { ...modifiedMockTransaction, status: status.SUBMISSION_HOLD };
      await createDevicesTransaction([mockDeviceTransaction(mockDeviceOne._id, admin._id), modifiedMockTransaction]);
      const res = await request(app)
        .get('/v1/deviceTransactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ status: `${status.SUBMISSION_HOLD}, ${status.OPEN}s` })
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
      expect(res.body.results[0]).toStrictEqual({
        id: modifiedMockTransaction._id.toHexString(),
        deviceId: {
          id: mockDeviceTwo._id.toString(),
          modalName: mockDeviceTwo.modalName,
          srNo: mockDeviceTwo.srNo,
          uuid: mockDeviceTwo.uuid,
          variant: mockDeviceTwo.variant,
          category: mockDeviceTwo.category,
          manufacturer: mockDeviceTwo.manufacturer,
          picture: mockDeviceTwo.picture,
        },
        userId: {
          id: admin._id.toString(),
          name: admin.name,
        },
        issuedOn: expect.anything(),
        dueDate: expect.anything(),
        submittedOn: null,
        status: modifiedMockTransaction.status,
      });
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
      const mockDeviceOneWithoutId = {};
      Object.assign(mockDeviceOneWithoutId, mockDeviceOne);
      delete mockDeviceOneWithoutId._id;
      expect(res.body).toMatchObject({
        submittedOn: null,
        userName: userOne.name,
        device: mockDeviceOneWithoutId,
        status: deviceTransaction.status,
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
      deviceTransaction.status = status.CLOSED;
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
    test('should return 204 if transaction is closed', async () => {
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

    test('should return 400 error if transactionId is not a valid mongo id', async () => {
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

  describe('Patch /v1/deviceTransactions/:transactionId', () => {
    let deviceTransaction;
    beforeEach(async () => {
      await insertUsers([userOne]);
      await insertDevices([mockDeviceOne]);
      deviceTransaction = mockDeviceTransaction(mockDeviceOne._id, userOne._id);
      await createDevicesTransaction([deviceTransaction]);
    });

    test('should return 200 and successfully update transaction if data is ok', async () => {
      const futureDate = new Date(deviceTransaction.dueDate);
      futureDate.setSeconds(deviceTransaction.dueDate.getSeconds() + 1);
      const updateBody = {
        dueDate: futureDate,
      };
      const res = await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        id: deviceTransaction._id.toHexString(),
        dueDate: updateBody.dueDate.toISOString(),
      });
    });
    test(`should return 200 and close the transaction & set deviceStatus to "${deviceStatusesList.AVAILABLE}" if "status" is "${status.CLOSED}"`, async () => {
      const updateBody = {
        status: status.CLOSED,
      };
      const res = await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        id: deviceTransaction._id.toHexString(),
        status: updateBody.status,
      });

      expect(res.body.submittedOn).not.toBeNull();

      // If device's "deviceStatus" has been set to "available" or not
      const dbDevice = await Device.findById(deviceTransaction.deviceId);
      expect(dbDevice).toBeDefined();
      expect(dbDevice.deviceStatus).toBe(deviceStatusesList.AVAILABLE);
    });

    test(`should return 200 and chnage deviceStatus to "${deviceStatusesList.BOOKED}" if transaction status is "${status.OPEN}"`, async () => {
      const updateBody = {
        status: status.OPEN,
      };
      const res = await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        id: deviceTransaction._id.toHexString(),
        status: updateBody.status,
      });

      // If "deviceStatus" has been set to "booked" or not
      const dbDevice = await Device.findById(deviceTransaction.deviceId);
      expect(dbDevice).toBeDefined();
      expect(dbDevice.deviceStatus).toBe(deviceStatusesList.BOOKED);
    });

    test(`should return 200 and chnage deviceStatus to "${deviceStatusesList.SUBMISSION_PENDING}" if transaction status is "${status.SUBMISSION_HOLD}"`, async () => {
      const updateBody = {
        status: status.SUBMISSION_HOLD,
      };
      const res = await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toMatchObject({
        id: deviceTransaction._id.toHexString(),
        status: updateBody.status,
      });

      // If "deviceStatus" has been set to "submission-pending" or not
      const dbDevice = await Device.findById(deviceTransaction.deviceId);
      expect(dbDevice).toBeDefined();
      expect(dbDevice.deviceStatus).toBe(deviceStatusesList.SUBMISSION_PENDING);
    });

    test('should return 401 error if access token is missing', async () => {
      const updateBody = {
        dueDate: faker.datatype.datetime(),
      };
      await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if user is updating a transaction that is not found', async () => {
      await insertDevices([mockDeviceTwo]);
      const deviceTransactionTwo = mockDeviceTransaction(mockDeviceTwo._id, userOne._id);
      const updateBody = {
        dueDate: faker.datatype.datetime(),
      };

      await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransactionTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if transactionId is not a valid mongo id', async () => {
      const updateBody = {
        dueDate: faker.datatype.datetime(),
      };

      await request(app)
        .patch(`/v1/deviceTransactions/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('Should return 400 error if dueDate is not a valid date', async () => {
      const updateBody = {
        dueDate: 'invalidDate',
      };
      await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('Should return 400 error if updated dueDate is of same/back_date from created dueDate', async () => {
      const futureDate = new Date(deviceTransaction.dueDate);
      futureDate.setSeconds(deviceTransaction.dueDate.getSeconds() - 1);
      const updateBody = {
        dueDate: futureDate,
      };
      await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('Should return 400 error for both dueDate & status updates simultaneously', async () => {
      const futureDate = new Date(deviceTransaction.dueDate);
      futureDate.setSeconds(deviceTransaction.dueDate.getSeconds() + 1);
      const updateBody = {
        dueDate: futureDate,
        status: status.CLOSED,
      };
      await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test(`Should return 400 error if status is otherthan '${status.OPEN}' or '${status.CLOSED}' or '${status.BOOKING_HOLD}' or '${status.SUBMISSION_HOLD}'`, async () => {
      const updateBody = {
        status: 'invalidStatus',
      };
      await request(app)
        .patch(`/v1/deviceTransactions/${deviceTransaction._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
