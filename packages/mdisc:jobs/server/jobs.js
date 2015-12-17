MdJobs.jc.allow({
  admin: function (userId, method, params) {
    if (Roles.userIsInRole(userId, ['admin'])) {
      return true;
    }
    return false;
  }
});

Meteor.startup(function () {
  if (Meteor.settings.isJobServer || process.env.IS_JOB_SERVER) {
    console.log('Job Server Started');
    MdJobs.jc.startJobServer();
  }
  MdJobs.jc.events.on('call', function (msg) {
    Meteor.users.update({_id: msg.userId, roles: {$in: ['job-server']}}, {$set: {"profile.lastActive": new Date()}});
  });
});