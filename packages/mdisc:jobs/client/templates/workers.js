var tick = 10000;
var reactiveDate = new ReactiveVar(new Date());

Meteor.setInterval((function () {
  return reactiveDate.set(new Date());
}), tick);

Template.mdJobsWorkers.helpers({
  workers: function () {
    var groupFilter = Session.get('filterWorkers');
    if (groupFilter) {
      return Meteor.users.find({roles: {$in: ['job-server']}, "profile.aruGroups": {$in: [groupFilter]}});
    } else {
      return Meteor.users.find({roles: {$in: ['job-server']}});
    }
  },
  
  isOnline: function (lastActive) {
    if (reactiveDate.get()-lastActive<tick) {
      return true;
    }
    return false;
  },
  
  hasFilter: function () {
    var groupFilter = Session.get('filterWorkers');
    if (groupFilter) {
      return true;
    }
    return false;
  },
  
  groupFilter: function () {
    return Session.get('filterWorkers');
  }
});

Template.mdJobsWorkers.events({
  'click .worker-row': function () {
    var type = '';
    switch (this.emails[0].address) {
      case 'downloadserver@mdisc.com':
        type = 'downloadArchive';
        break;
      case 'nasserver@mdisc.com':
        type = 'moveArchiveToNAS-';
        break;
      case 'aruserver@mdisc.com':
        type = 'recordArchiveOnARU-';
        break;
    }
    Session.set('filterJobs', type);
    Router.go('mdJobsWorking');
  },
  
  'click .removeFilter': function () {
    Session.set('filterWorkers', '');
  }
});