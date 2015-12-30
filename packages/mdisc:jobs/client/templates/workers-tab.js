var tick = 10000;
var reactiveDate = new ReactiveVar(new Date());

Meteor.setInterval((function () {
  return reactiveDate.set(new Date());
}), tick);

Template.mdJobsViewWorkersTab.helpers({
  tabData: function () {
    var workerTabs = new Array();
    Meteor.users.find({roles: {$in: ['job-server']}}).forEach(function (worker) {
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
      showTitle: true,
      title: "Workers",
      pages: workerTabs
    };
  }
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
