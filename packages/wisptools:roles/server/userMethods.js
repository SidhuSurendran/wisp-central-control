Meteor.methods({
  /**
   * update a user's permissions
  
   */
  updateRoles: function (targetUserId, roles, group) {
    var loggedInUser = Meteor.user()
       
    if (!loggedInUser ||
        !Roles.userIsInRole(loggedInUser, 
                            ['admin'])) {
      throw new Meteor.Error(403, "Access denied")
    }

    Roles.setUserRoles(targetUserId, roles);
    Roles.addUsersToRoles(targetUserId,roles);
  }
  
  
});
