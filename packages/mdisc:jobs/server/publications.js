Meteor.publish('jobWorkers', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return Meteor.users.find({roles: {$in: ['job-server']}});
  }
  return false;
});

Meteor.publish('allJobs', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return MdJobs.jc.find({});
  }
  return false;
});
