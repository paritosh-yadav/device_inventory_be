const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getAlldevices']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'addDevice', 'getAlldevices']);

module.exports = {
  roles,
  roleRights,
};
