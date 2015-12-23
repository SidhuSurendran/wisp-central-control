Package.describe({
  name: 'mdisc:jobs',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');

  api.use([
    'templating',
    'iron:router@1.0.7',
    'wisptools:menu',
    'wisptools:collection',
    'wisptools:roles',
    'vsivsi:job-collection@1.2.3',
    'reactive-var',
    'wisptools:growl'
  ]);    

  api.addFiles([
    'client/templates/admin-view.html',
    'client/templates/admin-view.js',
    'client/templates/job-table.html',
    'client/templates/job-table.js',
    'client/templates/workers.html',
    'client/templates/workers.js',
    'client/templates/manage-aru-groups.html',
    'client/templates/manage-aru-groups.js',
    'client/templates/aru-groups.html',
    'client/templates/aru-groups.js',
    'client/menu.js',
    'client/subscriptions.js'
    ], ['client']);

  api.addFiles([
    'lib/collections.js',
    'lib/router.js'
    ], ['server','client']);

  api.addFiles([
    'server/methods.js',
    'server/publications.js',
    'server/jobs.js'
    ], ['server']);
  
  api.export('Jobs');
  api.export('JobCollection');
  api.export('MdJobs');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mdisc:jobs');
  api.addFiles('jobs-tests.js');
});
