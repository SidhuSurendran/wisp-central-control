// Set up login services
Meteor.startup(function() {
  ServiceConfiguration.configurations.upsert(
    { service: "google" },
    {
      $set: {
        clientId: Meteor.settings.google.clientId,
        loginStyle: "redirect",
        secret: Meteor.settings.google.secret
      }
    }
  );

  Accounts.onCreateUser(function(options, user) {

    // Assign Role
    // TODO: Do this check in only dev mode.  In production just assign the customer role.
    if(Meteor.users.find().count() < 1) {    
      user.roles = ['admin'];
      Roles.addUsersToRoles(user._id,['admin']);
    } else {
      user.roles = ['customer'];
      Roles.addUsersToRoles(user._id,['customer']);
    }

    // Send welcome email
    Meteor.call('sendWelcomeEmail', user);

    // We still want the default hook's 'profile' behavior.
    if (options.profile)
      user.profile = options.profile;

    return user;
  });

});
