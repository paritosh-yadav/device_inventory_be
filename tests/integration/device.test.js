const faker = require('faker');
const request = require('supertest');
const httpStatus = require('http-status');
const setupTestDB = require('../utils/setupTestDB');
const { Device } = require('../../src/models');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { mockDeviceOne, mockDeviceTwo, insertDevices, deleteDevice } = require('../fixtures/device.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const app = require('../../src/app');

setupTestDB();

describe('Device routes', () => {
  describe('POST /v1/devices', () => {
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
      await insertUsers([admin]);
    });
    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.FORBIDDEN);
    });
    test('should return 201 and successfully create new device if data is ok', async () => {
      const res = await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        modalName: newDevice.modalName,
        srNo: newDevice.srNo,
        uuid: newDevice.uuid,
        variant: newDevice.variant,
        category: newDevice.category,
        manufacturer: newDevice.manufacturer,
        isIssued: false,
      });

      const dbDevice = await Device.findById(res.body.id);
      expect(dbDevice).toBeDefined();
      expect(dbDevice).toMatchObject({});

      expect(dbDevice).toMatchObject({
        modalName: newDevice.modalName,
        srNo: newDevice.srNo,
        uuid: newDevice.uuid,
        variant: newDevice.variant,
        category: newDevice.category,
        manufacturer: newDevice.manufacturer,
      });
    });
    test('should return 401 error is access token is missing', async () => {
      await request(app).post('/v1/devices').send(newDevice).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if modal name is not alphanumeric', async () => {
      newDevice.modalName = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if serial number is not alphanumeric', async () => {
      newDevice.srNo = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if UUID is not alphanumeric', async () => {
      newDevice.uuid = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if variant is not alphanumeric', async () => {
      newDevice.variant = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if category is not alpha', async () => {
      newDevice.category = 122;
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if manufacturer is not alphanumeric', async () => {
      newDevice.manufacturer = '!@#$%^&*()_+';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices', () => {
    beforeEach(async () => {
      await insertUsers([userOne]);
    });
    test('should return 200 and apply the default query options', async () => {
      await insertDevices([mockDeviceOne]);
      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
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
      expect(res.body.results[0]).toEqual({
        isIssued: false,
        modalName: mockDeviceOne.modalName,
        srNo: mockDeviceOne.srNo,
        uuid: mockDeviceOne.uuid,
        variant: mockDeviceOne.variant,
        category: mockDeviceOne.category,
        manufacturer: mockDeviceOne.manufacturer,
        id: mockDeviceOne._id.toHexString(),
      });
    });
    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/devices').send().expect(httpStatus.UNAUTHORIZED);
    });
    test('should correctly apply filter on modal name field', async () => {
      await insertDevices([mockDeviceOne, mockDeviceTwo]);
      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ modalName: mockDeviceOne.modalName })
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
      expect(res.body.results[0].id).toBe(mockDeviceOne._id.toHexString());
    });
    test('should correctly apply filter on isIssued field', async () => {
      const modifiedMockDevice = { ...mockDeviceOne, isIssued: true };
      await insertDevices([modifiedMockDevice, mockDeviceTwo]);
      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ isIssued: modifiedMockDevice.isIssued })
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
      expect(res.body.results[0].id).toBe(mockDeviceOne._id.toHexString());
    });
    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertDevices([mockDeviceOne, mockDeviceTwo]);

      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ sortBy: 'modalName:desc' })
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

      const expectedOrder = [mockDeviceOne, mockDeviceTwo].sort((a, b) => (a.modalName > b.modalName ? -1 : 1));

      expectedOrder.forEach((device, index) => {
        expect(res.body.results[index].id).toBe(device._id.toHexString());
      });
    });
    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertDevices([mockDeviceOne, mockDeviceTwo]);

      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ sortBy: 'modalName:asc' })
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

      const expectedOrder = [mockDeviceOne, mockDeviceTwo].sort((a, b) => (a.modalName < b.modalName ? -1 : 1));

      expectedOrder.forEach((device, index) => {
        expect(res.body.results[index].id).toBe(device._id.toHexString());
      });
    });
    test('should limit returned array if limit param is specified', async () => {
      await insertDevices([mockDeviceOne, mockDeviceTwo]);

      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
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
      expect(res.body.results[0].id).toBe(mockDeviceOne._id.toHexString());
      expect(res.body.results[1].id).toBe(mockDeviceTwo._id.toHexString());
    });
    test('should return the correct page if page and limit params are specified', async () => {
      await insertDevices([mockDeviceOne, mockDeviceTwo]);

      const res = await request(app)
        .get('/v1/devices')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
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
      expect(res.body.results[0].id).toBe(mockDeviceTwo._id.toHexString());
    });
  });

  describe('GET /v1/devices/:deviceId', () => {
    beforeEach(async () => {
      await insertUsers([userOne]);
      await insertDevices([mockDeviceOne]);
    });
    test('should return 200 and the device object if data is ok', async () => {
      const res = await request(app)
        .get(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        isIssued: false,
        modalName: mockDeviceOne.modalName,
        srNo: mockDeviceOne.srNo,
        uuid: mockDeviceOne.uuid,
        variant: mockDeviceOne.variant,
        category: mockDeviceOne.category,
        manufacturer: mockDeviceOne.manufacturer,
        id: mockDeviceOne._id.toHexString(),
      });
    });
    test('should return 401 error if access token is missing', async () => {
      await request(app).get(`/v1/devices/${mockDeviceOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if deviceId is not a valid mongo id', async () => {
      await request(app)
        .get(`/v1/devices/invaliddeviceid`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if device is not found', async () => {
      await request(app)
        .get(`/v1/devices/${mockDeviceTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('Delete /v1/devices/:deviceId', () => {
    beforeEach(async () => {
      await insertUsers([admin]);
      await insertDevices([mockDeviceOne]);
    });
    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);
      await request(app)
        .delete(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });
    test('should return 204 if data is ok', async () => {
      await request(app)
        .delete(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      const dbDevice = await Device.findById(mockDeviceOne._id);
      expect(dbDevice).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/devices/${mockDeviceOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if deviceId is not a valid mongo id', async () => {
      await request(app)
        .delete('/v1/devices/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if device not found', async () => {
      await deleteDevice(mockDeviceOne);
      await request(app)
        .delete(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('Patch /v1/devices/:deviceId', () => {
    beforeEach(async () => {
      await insertUsers([userOne]);
      await insertDevices([mockDeviceOne]);
    });
    test('should return 200 and successfully update device if data is ok', async () => {
      const updateBody = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.alpha(),
        manufacturer: faker.random.alpha(),
        isIssued: faker.random.boolean(),
      };

      const res = await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: mockDeviceOne._id.toHexString(),
        modalName: updateBody.modalName,
        srNo: updateBody.srNo,
        uuid: updateBody.uuid,
        variant: updateBody.variant,
        category: updateBody.category,
        manufacturer: updateBody.manufacturer,
        isIssued: updateBody.isIssued,
      });
    });
    test('should return 401 error if access token is missing', async () => {
      const updateBody = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.alpha(),
        manufacturer: faker.random.alpha(),
        isIssued: faker.random.boolean(),
      };
      await request(app).patch(`/v1/devices/${mockDeviceOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });
    test('should return 404 if user is updating a device that is not found', async () => {
      const updateBody = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.alpha(),
        manufacturer: faker.random.alpha(),
        isIssued: faker.random.boolean(),
      };

      await request(app)
        .patch(`/v1/devices/${mockDeviceTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });
    test('should return 400 error if deviceId is not a valid mongo id', async () => {
      const updateBody = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.alpha(),
        manufacturer: faker.random.alpha(),
        isIssued: faker.random.boolean(),
      };

      await request(app)
        .patch(`/v1/devices/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if modal name is not alphanumeric', async () => {
      const updateBody = {
        modalName: 'Invalid#charecter',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if serial number is not alphanumeric', async () => {
      const updateBody = {
        srNo: '!',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if serial number is already taken', async () => {
      await insertDevices([mockDeviceTwo]);
      const updateBody = {
        srNo: mockDeviceTwo.srNo,
      };

      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if UUID is not alphanumeric', async () => {
      const updateBody = {
        uuid: '#',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if UUID is already taken', async () => {
      await insertDevices([mockDeviceTwo]);
      const updateBody = {
        uuid: mockDeviceTwo.uuid,
      };

      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if varient is not alphanumeric', async () => {
      const updateBody = {
        variant: '@',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if category only contains alphabets', async () => {
      const updateBody = {
        category: 'withnumber12',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if manufacturer only contains alphabets with/without space', async () => {
      const updateBody = {
        manufacturer: 'Withnumber12',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 if isIssued should be boolean', async () => {
      const updateBody = {
        isIssued: 'non-boolean',
      };
      await request(app)
        .patch(`/v1/devices/${mockDeviceOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
