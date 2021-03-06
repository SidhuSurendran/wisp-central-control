Package.describe({
  name: 'mdisc:duplication-house',
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
  api.versionsFrom('1.1.0.2');

  api.use([
    'meteor',
    'mongo',
    'templating',
    'iron:router@1.0.7',
    'wisptools:collection',
    'wisptools:menu',
    'wisptools:growl',
  ]);

  api.addFiles([
    'lib/collection.js'
    ], ['server','client']);

  api.export('MdDuplicationHouse');

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('mdisc:duplication-house');
  api.addFiles('duplication-house-tests.js');
});
