const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getDevices', 'updateDevice', 'manageDeviceTransactions']);
roleRights.set(roles[1], [
  'getUsers',
  'manageUsers',
  'addDevice',
  'deleteDevice',
  'getDevices',
  'updateDevice',
  'manageDeviceTransactions',
]);

module.exports = {
  roles,
  roleRights,
};
