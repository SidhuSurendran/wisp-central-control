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
  }
});
