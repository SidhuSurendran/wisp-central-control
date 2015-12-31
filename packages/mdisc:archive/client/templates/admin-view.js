Template.mdArchiveAdminView.events({
  "change #selStatus": function(event) {
    event.preventDefault();
    var selStatus = $(event.target).val();
      Session.set("mdArchiveAdminViewStatus",selStatus);
  },
  "change #selDate": function(event) {
    event.preventDefault();
    var selValue = $(event.target).val();
    Session.set('mdArchiveAdminViewDate', selValue);
  },
});

Template.mdArchiveAdminView.rendered=function(){
  Session.set('mdArchiveAdminViewStatus', 'Ready');
  Session.set('mdArchiveAdminViewDate', '1');
};


Template.mdArchiveAll.helpers({
  archives: function () {
    return MdArchive.collection.find().fetch();
  }
});

Template.mdArchiveAll.helpers({
  archives: function () {
    var search = {};
    var daysBack = new Date();
    var unixTimeOneDay = 86400000;

    // Set the days back filter
    if(Session.get('mdArchiveAdminViewDate')) {
      if (Session.get('mdArchiveAdminViewDate') != 0) {
        daysBack.setTime(daysBack.getTime() - (Session.get('mdArchiveAdminViewDate') * unixTimeOneDay));
        search.updatedAt = {$gte: daysBack};
      }
    } else {
      daysBack.setTime(daysBack.getTime() - (30 * unixTimeOneDay));
      search.updatedAt = {$gte: daysBack};
    }

    // Set the status filter
    if(Session.get('mdArchiveAdminViewStatus') != "All" && Session.get('mdArchiveAdminViewStatus')) {
      search.status = Session.get('mdArchiveAdminViewStatus');
    }

    var data= MdArchive.collection.find(search).fetch();
    if(data == "") {
      WtGrowl.fail("No Results");
    }
    return data;
  },
  isReady: function (status) {
    if(status=="Ready") {
      return true;
    } else {
      return false;
    }
  }
});
Template.mdArchiveAll.events({
  "click .send-to-aru": function(event) {
    event.preventDefault();
    var id = $(event.target).val();
    var jobTag = 'default';
    var parentData = Template.parentData(0);
    if (parentData && parentData.worker && parentData.worker.profile && parentData.worker.profile.jobTag) {
      jobTag = parentData.worker.profile.jobTag;
    }
    Meteor.call('recordArchiveOnARU', jobTag, id);
  },
});
