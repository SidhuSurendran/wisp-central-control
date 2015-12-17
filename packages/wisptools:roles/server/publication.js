Meteor.publish('admin', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return Meteor.users.find();
  } else {
    return false;
  }
});

Meteor.publish('roles', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return Meteor.roles.find();
  } else {
    return false;
  }
});
