const faker = require('faker');
const request = require('supertest');
const httpStatus = require('http-status');
const setupTestDB = require('../utils/setupTestDB');
const { Device } = require('../../src/models');
const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
const { mockDeviceOne, mockDeviceTwo, insertDevices } = require('../fixtures/device.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const app = require('../../src/app');

setupTestDB();

describe('Device routes', () => {
  describe('POST /v1/devices', () => {
    let newDevice;
    beforeEach(() => {
      newDevice = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.alpha(),
        manufacturer: faker.random.alpha(),
      };
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
      await insertUsers([admin]);
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
      await insertUsers([admin]);
      await request(app).post('/v1/devices').send(newDevice).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if modal name is not alphanumeric', async () => {
      await insertUsers([admin]);
      newDevice.modalName = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if serial number is not alphanumeric', async () => {
      await insertUsers([admin]);
      newDevice.srNo = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if UUID is not alphanumeric', async () => {
      await insertUsers([admin]);
      newDevice.uuid = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if variant is not alphanumeric', async () => {
      await insertUsers([admin]);
      newDevice.variant = '@$#%$^';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if category is not alpha', async () => {
      await insertUsers([admin]);
      newDevice.category = 122;
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
    test('should return 400 error if manufacturer is not alphanumeric', async () => {
      await insertUsers([admin]);
      newDevice.manufacturer = '!@#$%^&*()_+';
      await request(app)
        .post('/v1/devices')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newDevice)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/devices', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne]);
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
      await insertUsers([userOne]);
      await request(app).get('/v1/devices').send().expect(httpStatus.UNAUTHORIZED);
    });
    test('should correctly apply filter on modal name field', async () => {
      await insertUsers([userOne]);
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
      await insertUsers([userOne]);
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
      await insertUsers([userOne]);
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
      await insertUsers([userOne]);
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
      await insertUsers([userOne]);
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
      await insertUsers([userOne]);
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
});
