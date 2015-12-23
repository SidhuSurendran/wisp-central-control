Template.mdArchiveName.onRendered(function() {
  Meteor.call('getFirstname', function(err, res) {
    if (err) return;
    Session.set('archiveName', mdArchiveName(res));
  });
});


Template.mdArchiveName.helpers({
  subscription: function() {
    return MdArchive.subscription.findOne({owner: Meteor.userId()});
  },
  archiveName: function() {
    var archive = MdArchive.subscription.findOne({owner: Meteor.userId()});
    if (archive && archive.archiveName != "") {
      return archive.archiveName;
    }
    return Session.get('archiveName');
  }
});

Template.mdArchiveName.events({
  'submit #archive-name-form': function(e, t) {
    e.preventDefault();
    var archiveName = e.target[0].value;
    var subscription = MdArchive.subscription.findOne({owner: Meteor.userId()});
    if (subscription) {
      MdArchive.subscription.update({_id: subscription._id}, {$set: {archiveName: archiveName}});
    } else {
      // Init a new subscription
      var data = {
        archiveName: archiveName,
        active: false,
        version: '0.0.1',
        subscriptionPlan: 'annual'
      }
      MdArchive.subscription.insert(data);

      // Add subscription number
      Meteor.call('mdCreateSubscriptionNumber', function (err, number) {
        var subscription = MdArchive.subscription.findOne({owner: Meteor.userId()});
        if (subscription) {
          MdArchive.subscription.update({_id: subscription._id}, {$set: {subscriptionNumber: number}});
        }
      });
    }
    WtAccordionPage.enable('arch_plan');
    WtAccordionPage.show('arch_plan');
  }  
});