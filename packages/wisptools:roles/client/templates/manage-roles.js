Template.wtRolesManageRoles.helpers({
  roleList: function () {
    return Meteor.roles.find();
  }
});

Template.wtRolesManageRoles.events({
  'click .addRolebtn': function () {
    var role = $('#rolename').val();
    if (role.trim().length<1) {
      WtGrowl.fail('Role name cannot be empty.');
    } else {
      Meteor.call('createRole', role, function (err, res) {
        if (err) {
          WtGrowl.fail('Failed to create new role.');
        } else {
          WtGrowl.success('New role created.');
          $('#rolename').val('');
        }
      });
    }
  },
  
  'click .removeRolebtn': function () {
    Meteor.call('deleteRole', this.name, function (err, res) {
      if (err) {
        WtGrowl.fail('Failed to delete role.');
      } else {
        WtGrowl.success('Role deleted successfully.');
      }
    });
  }
});