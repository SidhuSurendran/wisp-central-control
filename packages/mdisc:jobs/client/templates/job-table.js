var indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item)
      return i;
  }
  return -1;
};

Template.mdJobsJobTable.helpers({
  jobs: function (jobFilter) {
    if (!jobFilter) {
      jobFilter = Session.get('filterJobs');
    }
    if (jobFilter) {
      var regx = new RegExp(jobFilter+".*");
      return MdJobs.jc.find({type: {$regex: regx}}, {sort: {after: -1}});
    } else {
      return MdJobs.jc.find({}, {sort: {after: -1}});
    }
  }
});

Template.mdJobsJobEntry.helpers({
  restartable: function () {
    if (indexOf.call(MdJobs.jc.jobStatusRestartable, this.status) > -1) {
      return true;
    }
    return false;
  },
  pausable: function () {
    if (indexOf.call(MdJobs.jc.jobStatusPausable, this.status) > -1) {
      return true;
    }
    return false;
  },
  cancellable: function () {
    if (indexOf.call(MdJobs.jc.jobStatusCancellable, this.status) > -1) {
      return true;
    }
    return false;
  },
  removable: function () {
    if (indexOf.call(MdJobs.jc.jobStatusRemovable, this.status) > -1) {
      return true;
    }
    return false;
  },
  round: function (num, digits) {
    return Math.round(num*Math.pow(10,digits))/Math.pow(10,digits);
  }
});

Template.mdJobsJobEntry.events({
  'click .pauseBtn': function () {
    job = Template.currentData();
    if (job) {
      job.pause(function (e, r) {
        if (r) {
          WtGrowl.success('Job has been paused.');
        } else {
          console.log(e);
          WtGrowl.fail('An error has occurred.');
        }
      });
    } else {
      WtGrowl.fail('An error has occurred.');
    }
  },
  'click .resumeBtn': function () {
    job = Template.currentData();
    if (job) {
      job.resume(function (e, r) {
        if (r) {
          WtGrowl.success('Job has been resumed.');
        } else {
          console.log(e);
          WtGrowl.fail('An error has occurred.');
        }
      });
    } else {
      WtGrowl.fail('An error has occurred.');
    }
  },
  'click .restartBtn': function () {
    job = Template.currentData();
    if (job) {
      job.restart(function (e, r) {
        if (r) {
          WtGrowl.success('Job has been restarted.');
        } else {
          console.log(e);
          WtGrowl.fail('An error has occurred.');
        }
      });
    } else {
      WtGrowl.fail('An error has occurred.');
    }
  },
  'click .rerunBtn': function () {
    job = Template.currentData();
    if (job) {
      job.rerun(function (e, r) {
        if (r) {
          WtGrowl.success('Job has been rerun.');
        } else {
          console.log(e);
          WtGrowl.fail('An error has occurred.');
        }
      });
    } else {
      WtGrowl.fail('An error has occurred.');
    }
  },
  'click .cancelBtn': function () {
    job = Template.currentData();
    if (job) {
      job.cancel(function (e, r) {
        if (r) {
          WtGrowl.success('Job has been canceled.');
        } else {
          console.log(e);
          WtGrowl.fail('An error has occurred.');
        }
      });
    } else {
      WtGrowl.fail('An error has occurred.');
    }
  },
  'click .removeBtn': function () {
    job = Template.currentData();
    if (job) {
      job.remove(function (e, r) {
        if (r) {
          WtGrowl.success('Job has been removed.');
        } else {
          console.log(e);
          WtGrowl.fail('An error has occurred.');
        }
      });
    } else {
      WtGrowl.fail('An error has occurred.');
    }
  }
});
