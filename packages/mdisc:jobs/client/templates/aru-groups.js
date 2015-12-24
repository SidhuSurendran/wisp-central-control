Template.mdJobsARUGroups.helpers({
  userList: function () {
    return Meteor.users.find({roles: {$in: ['job-server']}});
  }
});

Template.mdJobsARUGroups.events({
  'blur .jobTagInput': function (e) {
    var jobTag = $(e.target).val();
    Meteor.call('updateJobTag', this._id, jobTag, function (err, res) {
      if (err) {
        WtGrowl.fail('Failed to update Job Tag.');
      } else {
        WtGrowl.success('Job Tag updated.');
      }
    });
  }
});

Template.mdJobsARUGroupsSelect.helpers({
  groupList: function () {
    return MdJobs.groups.find();
  },
  checked: function (group, groupList) {
    if (groupList && groupList.indexOf(group) > -1) {
      return "checked";
    }
    return "";
  }
});

Template.mdJobsARUGroupsSelect.events({
  "change .groupCheckBox": function (event, template) {
    if ($(event.target).is(':checked')) {
      Meteor.call('addARUGroupToUser', template.data._id, this.name, function (err, res) {
        if (err) {
          WtGrowl.fail('Failed to update ARU Group.');
          $(event.target).prop('checked', false);
        } else {
          WtGrowl.success('ARU Group updated.');
        }
      });
    } else {
      Meteor.call('removeARUGroupFromUser', template.data._id, this.name, function (err, res) {
        if (err) {
          WtGrowl.fail('Failed to update ARU Group.');
          $(event.target).prop('checked', true);
        } else {
          WtGrowl.success('ARU Group updated.');
        }
      });
    }
  }
});
