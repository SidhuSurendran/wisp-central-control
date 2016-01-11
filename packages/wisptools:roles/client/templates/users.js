Template.wtRolesUser.helpers({
  userList: function () {
    return Meteor.users.find();
  }
});

Template.wtRolesUsersSelect.helpers({
  roleList: function () {
    return Meteor.roles.find();
  },
  checked: function (role, roleList) {
    if (roleList.indexOf(role) > -1) {
      return "checked";
    }
    return "";
  },
  disabled: function (role, roleList, userId) {
    if (Meteor.userId()==userId && role=="admin") {
      return "disabled";
    }
    if (roleList.length<2 && roleList.indexOf(role)>-1) {
      return "disabled";
    }
    return "";
  }
});

Template.wtRolesUsersSelect.events({
  "change .roleCheckBox": function (event, template) {
    if ($(event.target).is(':checked')) {
      Meteor.call('addRoleToUser', template.data._id, this.name, function (err, res) {
        if (err) {
          WtGrowl.fail('Failed to update role.');
          $(event.target).prop('checked', false);
        } else {
          WtGrowl.success('Role updated.');
        }
      });
    } else {
      Meteor.call('removeRoleFromUser', template.data._id, this.name, function (err, res) {
        if (err) {
          WtGrowl.fail('Failed to update role.');
          $(event.target).prop('checked', true);
        } else {
          WtGrowl.success('Role updated.');
        }
      });
    }
  }
});
