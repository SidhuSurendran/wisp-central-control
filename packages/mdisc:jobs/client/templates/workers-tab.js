Template.mdJobsViewWorkersTab.helpers({
  tabData: function () {
    var workerTabs = new Array();
    Meteor.users.find({roles: {$in: ['job-server']}}).forEach(function (worker) {
      workerTabs.push({
        tabName: worker.profile.jobTag,
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
