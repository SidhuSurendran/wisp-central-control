Template.mdCloudGoogleOrderPlaced.onRendered(function () {
  Session.set('isCloudConnecting', true); // turn on steps menu
  Session.set('cloudConnectingStep', 4);  // set menu on last step
});

Template.mdCloudGoogleOrderPlaced.helpers({
  subscription: function () {
    return MdArchive.subscription.findOne({owner: Meteor.userId()});
  }
});