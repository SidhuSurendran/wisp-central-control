Router.route('/working/', {
  name: 'mdJobsWorking', 
  template: 'mdJobsWorking'
});

Router.route('/workers/', {
  name: 'mdJobsWorkers', 
  template: 'mdJobsWorkers'
});

Router.route('/aru-groups/', {
  name: 'mdJobsARUGroups',
  template: 'mdJobsARUGroups'
});

Router.route('/manage-aru-groups/', {
  name: 'mdJobsManageARUGroups',
  template: 'mdJobsManageARUGroups'
});

Router.route('/workers-overview/', {
  name: 'mdJobsViewWorkersOverview',
  template: 'mdJobsViewWorkersOverview'
});

Router.route('/workers-tab/', {
  name: 'mdJobsViewWorkersTab',
  template: 'mdJobsViewWorkersTab'
});
