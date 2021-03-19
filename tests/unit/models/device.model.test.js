const faker = require('faker');
const { Device } = require('../../../src/models');

describe('Device model', () => {
  describe('Device validation', () => {
    let newDevice;
    beforeEach(() => {
      newDevice = {
        modalName: faker.lorem.word(),
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
    test('should throw validation error is modalName does not contain alphabets', async () => {
      newDevice.modalName = 123;
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
  });
});
