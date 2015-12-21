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
  })
};