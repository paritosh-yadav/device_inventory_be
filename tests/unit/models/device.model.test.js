const faker = require('faker');
const { Device } = require('../../../src/models');

describe('Device model', () => {
  describe('Device validation', () => {
    let newDevice;
    beforeEach(() => {
      newDevice = {
        modalName: faker.name.findName(),
        srNo: faker.random.alphaNumeric(),
        uuid: faker.random.alphaNumeric(),
        variant: faker.random.alphaNumeric(),
        category: faker.random.word(),
        manufacturer: faker.random.word(),
      };
    });
    test('should correctly validate a valid device', async () => {
      await expect(new Device(newDevice).validate()).resolves.toBeUndefined();
    });
    test('should throw validation error is modalName in not string', async () => {
      newDevice.modalName = 123;
      await expect(new Device(newDevice).validate()).rejects.toThrow();
    });
  });
});
