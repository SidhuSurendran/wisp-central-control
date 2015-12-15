// Server side only methods
Meteor.methods({
  sendEmail: function (template, email) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    Mandrill.messages.sendTemplate({
      template_name: template,
      template_content: [],
      message: {
        to: [{email: email}],
        global_merge_vars: [
          {
            name: 'firstname',
            content: 'TEST'
          }
        ]
      }
    }, function (err, res) {
      console.log(err);
    });
  },
  // Used for emails templates that only have a name
  sendEmailById: function (template, userId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin

    var user = Meteor.users.findOne({_id: userId});
    if (!user) throw new Meteor.Error(404, "User not found");
    var firstname = Meteor.call('getFirstname', user);
    var email = Meteor.call('getEmail', user);

    Mandrill.messages.sendTemplate({
      template_name: template,
      template_content: [],
      message: {
        to: [{email: email}],
        global_merge_vars: [
          {
            name: 'firstname',
            content: firstname
          }
        ]
      }
    }, function (err, res) {
      console.log(err);
    });
  },
  sendArchiveShippedEmail: function (archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var archive = MdArchive.collection.findOne({_id: archiveId});
    if (!archive) throw new Meteor.Error(404, "Archive not found");

    var user = Meteor.users.findOne({_id: archive.owner});
    if (!user) throw new Meteor.Error(404, "User not found");
    var firstname = Meteor.call('getFirstname', user);
    var email = Meteor.call('getEmail', user);

    Mandrill.messages.sendTemplate({
      template_name: 'concierge-order-shipped',
      template_content: [],
      message: {
        to: [{email: email}],
        global_merge_vars: [
          {
            name: 'firstname',
            content: firstname
          },{
            name: 'trackingnumber',
            content: archive.trackingId
          }
        ]
      }
    }, function (err, res) {
      console.log(err);
    });
  },
  sendWelcomeEmail: function (user) {
    if (!user) user = Meteor.user();
    if (!user) { return null; }

    var firstname = Meteor.call('getFirstname', user);
    var email = Meteor.call('getEmail', user);

    Mandrill.messages.sendTemplate({
      template_name: 'new-account',
      template_content: [],
      message: {
        to: [{email: email}],
        global_merge_vars: [
          {
            name: 'firstname',
            content: firstname
          }
        ]
      }
    }, function (err, res) {
      console.log(err);
    });
  }
});
