Meteor.methods({
  getFirstname: function (user) {
    if (!user) user = Meteor.user();
    if (!user) { return null; }

    var firstname = '';
    if (user.hasOwnProperty('services')) {
      // Google
      if (user.services.hasOwnProperty('google')) {
        firstname = user.services.google.given_name;
      }
    }
    return firstname;

  },
  getFullName: function (user) {
    if (!user) user = Meteor.user();
    if (!user) { return null; }

    var name = '';
    if (user.hasOwnProperty('services')) {
      // Google
      if (user.services.hasOwnProperty('google')) {
        name = user.services.google.name;
      }
    }
    return name;

  },
  getEmail: function (user) {
    if (!user) user = Meteor.user();
    if (!user) { return null; }

    var email = '';
    // Standard Email
    if (user.hasOwnProperty('email')) {
      email = user.email[0].address;
    }
    if (user.hasOwnProperty('services')) {
      // Google
      if (user.services.hasOwnProperty('google')) {
        email = user.services.google.email;
      }
    }
    return email;

  }
});