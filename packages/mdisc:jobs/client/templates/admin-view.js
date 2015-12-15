var tick = 2500;
var reactiveDate = new ReactiveVar(new Date());

Meteor.setInterval((function () {
  return reactiveDate.set(new Date());
}), tick);

var timeFormatter = function (time) {
  var now = reactiveDate.get();
  if (Math.abs(time - now) < tick) {
    return "Now";
  } else {
    return moment(time).from(now);
  }
};

Template.registerHelper("relativeTime", function (time) {
  return timeFormatter(time);
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.mdJobsWorking.helpers({
  hasFilter: function () {
    var jobFilter = Session.get('filterJobs');
    if (jobFilter) {
      return true;
    }
    return false;
  },
  jobFilter: function () {
    return Session.get('filterJobs');
  }
});

Template.mdJobsWorking.events({
  'click .removeFilter': function () {
    Session.set('filterJobs', '');
  }
});
