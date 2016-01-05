var tick = 10000;
var reactiveDate = new ReactiveVar(new Date());

Meteor.setInterval((function () {
  return reactiveDate.set(new Date());
}), tick);

Template.mdJobsViewWorkersTab.helpers({
  filterGroup: function () {
    return Session.get('filterGroup');
  },
  tabData: function () {
    var workerTabs = new Array();
    var filterGroup = Session.get('filterGroup');
    Meteor.users.find({roles: {$in: ['job-server']}, "profile.aruGroups": {$in: [filterGroup]}}).forEach(function (worker) {
      var tabIcon = '';
      if (reactiveDate.get()-worker.profile.lastActive<tick) {
        tabIcon = '<i class="fa fa-circle pull-right text-success'+'"></i>';
      } else {
        tabIcon = '<i class="fa fa-circle pull-right text-danger'+'"></i>';
      }
      workerTabs.push({
        tabName: worker.profile.jobTag,
        tabIcon: tabIcon,
        tabId: "worker-tab-"+workerTabs.length,
        tabTemplate: "mdJobsViewWorkersTabContent",
        worker: worker
      });
    });
    return {
      showTitle: false,
      title: "Workers",
      pages: workerTabs
    };
  }
});

Template.mdJobsViewWorkersTab.onCreated(function () {
  Session.set('mdArchiveAdminViewStatus', 'Ready');
  Session.set('mdArchiveAdminViewDate', '0');
});

Template.mdJobsViewWorkersTabContent.helpers({
  isOnline: function (lastActive) {
    if (reactiveDate.get() - lastActive < tick) {
      return true;
    }
    return false;
  },
  jobFilter: function () {
    return "recordArchiveOnARU-"+this.worker.profile.jobTag;
  }
});
