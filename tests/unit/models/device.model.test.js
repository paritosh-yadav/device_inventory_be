const faker = require('faker');
const { Device } = require('../../../src/models');

describe('Device model', () => {
  describe('Device validation', () => {
    let newDevice;
    beforeEach(() => {
      newDevice = {
        modalName: faker.random.alphaNumeric(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.lorem.word(),
        manufacturer: faker.lorem.word(),
      };
    });
    test('should correctly validate a valid device', async () => {
      await expect(new Device(newDevice).validate()).resolves.toBeUndefined();
    });
    test('should throw validation error is modal name is not alphanumeric', async () => {
      newDevice.modalName = '#@$%^%!';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
    test('should throw validation error is serial number is not alphanumeric', async () => {
      newDevice.srNo = '#@$%^%!';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
    test('should throw validation error is UUID is not alphanumeric', async () => {
      newDevice.uuid = '#@$%^%!';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
    test('should throw validation error is varient is not alphanumeric', async () => {
      newDevice.variant = '#@$%^%!';
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
    test('should throw validation error is category is not alpha', async () => {
      newDevice.category = 12;
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
    test('should throw validation error is manufacturer is not alpha', async () => {
      newDevice.manufacturer = 131;
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
  });
});
