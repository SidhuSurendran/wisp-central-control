Meteor.methods({
  downloadArchive: function (archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var job = new Job(MdJobs.jc, 'downloadArchive', 
      {
        archiveId: archiveId
      }
    );
    job.priority('normal').retry({retries: 5, wait: 5*60*1000}).save();
  },
  moveArchiveToNAS: function (server, data) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var job = new Job(MdJobs.jc, 'moveArchiveToNAS-' + server, data);
    job.priority('normal').retry({retries: 5, wait: 5*60*1000}).save();
    //TODO: check if moveArchiveToNAS is paused
  },
  recordArchiveOnARU: function (aru, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var job = new Job(MdJobs.jc, 'recordArchiveOnARU-' + aru, 
      {
        archiveId: archiveId
      }
    );
    job.priority('normal').retry({retries: 5, wait: 5*60*1000}).save();
    Meteor.call('setArchiveStatus', 'Queued', archiveId);
  },
  pauseArchiveToNAS: function () {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdJobs.paused.update({jobType: 'moveArchiveToNAS'}, {$set: {paused: true}}, {upsert: true});
    //TODO: find all type moveArchiveToNAS jobs that are waiting or ready then call MdJobs.jc.pauseJobs()
  },
  resumeArchiveToNAS: function () {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdJobs.paused.update({jobType: 'moveArchiveToNAS'}, {$set: {paused: true}}, {upsert: false});
    //TODO: find all type moveArchiveToNAS jobs that are waiting or ready then call MdJobs.jc.resumeJobs()
  },
  createARUGroup: function (name) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized");
    var group = MdJobs.groups.findOne({name: name});
    if (group) {
      throw new Meteor.Error("Group already exists");
    } else {
      MdJobs.groups.insert({name: name});
    }
  },
  deleteARUGroup: function (name) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized");
    var user = Meteor.users.findOne({"profile.aruGroups": {$in: [name]}});
    if (user) {
      throw new Meteor.Error("Group in use.");
    } else {
      MdJobs.groups.remove({name: name});
    }
  },
  addARUGroupToUser: function (userId, group) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized");
    var user = Meteor.users.findOne({_id: userId, "profile.aruGroups": {$in: [group]}});
    if (!user) {
      Meteor.users.update({_id: userId}, {$push: {"profile.aruGroups": group}});
    }
  },
  removeARUGroupFromUser: function (userId, group) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized");
    Meteor.users.update({_id: userId}, {$pull: {"profile.aruGroups": group}});
  },
  updateJobTag: function (userId, jobTag) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized");
    Meteor.users.update({_id: userId}, {$set: {"profile.jobTag": jobTag}});
  }
});
