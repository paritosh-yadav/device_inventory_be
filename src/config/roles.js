const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getDevices', 'updateDevice']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'addDevice', 'deleteDevice', 'getDevices', 'updateDevice']);

module.exports = {
  roles,
  roleRights,
};
