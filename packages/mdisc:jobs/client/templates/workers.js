var tick = 10000;
var reactiveDate = new ReactiveVar(new Date());

Meteor.setInterval((function () {
  return reactiveDate.set(new Date());
}), tick);

Template.mdJobsWorkers.helpers({
  workers: function () {
    return MdJobs.stats.find();
  },
  
  isOnline: function (lastCall) {
    if (reactiveDate.get()-lastCall<tick) {
      return true;
    }
    return false;
  }
});