Template.mdJobsViewWorkersOverview.helpers({
  groupList: function () {
    return MdJobs.groups.find();
  }
});

Template.mdJobsViewWorkersOverview.events({
  'click .viewWorkers': function () {
    Session.set('filterGroup', this.name);
    Router.go('mdJobsViewWorkersTab');
  }
});
