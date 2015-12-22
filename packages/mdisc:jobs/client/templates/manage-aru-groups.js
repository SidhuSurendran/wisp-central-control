Template.mdJobsManageARUGroups.helpers({
  groupList: function () {
    return MdJobs.groups.find();
  }
});

Template.mdJobsManageARUGroups.events({
  'click .addGroupbtn': function () {
    var group = $('#groupname').val();
    if (group.trim().length<1) {
      WtGrowl.fail('Group name cannot be empty.');
    } else {
      Meteor.call('createARUGroup', group, function (err, res) {
        if (err) {
          WtGrowl.fail('Failed to create new group.');
        } else {
          WtGrowl.success('New group created.');
          $('#groupname').val('');
        }
      });
    }
  },
  
  'click .removeGroupbtn': function () {
    Meteor.call('deleteARUGroup', this.name, function (err, res) {
      if (err) {
        WtGrowl.fail('Failed to delete group.');
      } else {
        WtGrowl.success('Group deleted successfully.');
      }
    });
  }
});
