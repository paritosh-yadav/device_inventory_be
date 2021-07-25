const faker = require('faker');
const mongoose = require('mongoose');
const { DeviceTransaction } = require('../../../src/models');

describe('Device transaction', () => {
  describe('Device transaction validation', () => {
    let newTransaction;
    beforeEach(() => {
      newTransaction = {
        deviceId: mongoose.Types.ObjectId(),
        userId: mongoose.Types.ObjectId(),
        issuedOn: faker.datatype.datetime(),
        dueDate: faker.datatype.datetime(),
        submittedOn: null,
      };
      //   console.log('newTransaction', newTransaction);
    });
    test('Should correctly validate a valid device booking', async () => {
      await expect(new DeviceTransaction(newTransaction).validate()).resolves.toBeUndefined();
    });

    test('Should throw validation error if deviceId is not valid', async () => {
      newTransaction.deviceId = 'invalidId';
      await expect(new DeviceTransaction(newTransaction).validate()).rejects.toThrow();
    });

    test('Should throw validation error if userId is not valid', async () => {
      newTransaction.userId = 'invalidId';
      await expect(new DeviceTransaction(newTransaction).validate()).rejects.toThrow();
    });

    test('Should throw validation error if issuedOn is not valid date', async () => {
      newTransaction.issuedOn = 'invalidDate';
      await expect(new DeviceTransaction(newTransaction).validate()).rejects.toThrow();
    });

    test('Should throw validation error if dueDate is not valid date', async () => {
      newTransaction.dueDate = 'invalidDate';
      await expect(new DeviceTransaction(newTransaction).validate()).rejects.toThrow();
    });

    test('Should throw validation error if submittedOn is not null', async () => {
      newTransaction.submittedOn = 'notnull';
      await expect(new DeviceTransaction(newTransaction).validate()).rejects.toThrow();
    });
  });
});
