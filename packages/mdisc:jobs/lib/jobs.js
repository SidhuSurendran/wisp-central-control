
MdJobs = {
  jc: new JobCollection('md_jobs', {
    transform: function (d) {
      var e, error, res;
      try {
        res = new Job(MdJobs.jc, d);
      } catch (error) {
        e = error;
        res = d;
      }
      return res;
    }
  }),
  
  stats: WtCollection('md_jobs_stats')

};

if (Meteor.isServer) {
  MdJobs.jc.allow({
    // Grant full permission to any authenticated user
    // ToDo: only allow admin role users this access level.
    admin: function (userId, method, params) {
      if (Roles.userIsInRole(userId, ['admin'])) return true;  // is admin
      return false; // everyone else;
    }
  });

  Meteor.startup(function () {
    // Normal Meteor publish call, the server always
    // controls what each client can see
    Meteor.publish('allJobs', function () {
      if (Roles.userIsInRole(this.userId, ['admin'])) return MdJobs.jc.find({});  // is admin
      return false; // everyone else;
    });
    if (Meteor.settings.isJobServer || process.env.IS_JOB_SERVER) {
      // Start the queue running
      console.log('Job Server Started');
      MdJobs.jc.startJobServer();
    }
    
    MdJobs.stats.remove({});
    if (Meteor.settings.workers) {
      var workers = Meteor.settings.workers;
      for (i in workers) {
        MdJobs.stats.insert({name: workers[i].name, userId: workers[i].userId, lastCall: 0});
      }
    }
    
    MdJobs.jc.events.on('call', function (msg) {
      MdJobs.stats.update({userId: msg.userId}, {$set: {lastCall: new Date()}});
    });

  });

}

if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.subscribe('allJobs');
  });
}