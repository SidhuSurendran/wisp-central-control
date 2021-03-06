
Template.mdArchivePlaceOrderButton.events({
  'click a#archivePlaceOrder': function(e, t) {

    var archiveId = Session.get('openArchiveId');

    MdArchive.collection.update({_id: archiveId}, {$set: {status: 'Ordered'}});
    Meteor.call('downloadArchive', archiveId);

  }
});

Template.mdArchiveOrder.onRendered(function () {
  WtTabPage.disable('arch_pay');
  WtTabPage.disable('arch_confirm');
});

Template.mdArchiveOrder.helpers({
  tabData: {
    showTitle: false,
    title: "Order",
    pages: [
      {
        tabName: "Shipping",
        tabId: "arch_order",
        tabTemplate: "mdArchiveAddress"
      },{
        tabName: "Payment",
        tabId: "arch_pay",
        tabTemplate: "mdArchivePayment"
      },{
        tabName: "Confirmation",
        tabId: "arch_confirm",
        tabTemplate: "mdArchiveConfrim"
      }
    ]
  }
});

Template.mdArchiveAddress.events({
  'blur #name': function(event, template) {
    if (!Session.get('archiveNameEdited')) {
      var archiveId = Session.get('openArchiveId');

      // get the first name
      var name = event.currentTarget.value.trim();
      if (name.indexOf(' ') > 0)
        name = name.slice(0, name.indexOf(' '));

      name = mdArchiveName(name);
      MdArchive.collection.update({_id: archiveId}, {$set: {archiveName: name}});

    }
  },
  'submit': function(e, t) {
    e.preventDefault();

    var archiveId = Session.get('openArchiveId');
    var formData = {};
    var shipTo;

    // Build object of form data
    for (var x = 0; x < e.target.length; x++) {
      if (e.target[x].name) {
        formData[e.target[x].name] = e.target[x].value;
      }
    }

    shipTo = {
      name: formData.name,
      address: formData.address,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip
    };



    MdArchive.collection.update({_id: archiveId}, {$set: {shipTo: shipTo}});
    WtTabPage.enable('arch_pay');
    WtTabPage.show('arch_pay');

    // Update the account address
    Meteor.users.update({_id: Meteor.userId()}, { $set:{"profile.shipTo": shipTo}}, function (err, res) {
      if (err)
        WtGrowl.fail("Could not update Shipping Information");
      else
        WtGrowl.success("Shipping Information updated");
    });

    // Update the first name
    var name = shipTo.name.trim();
    if (name.indexOf(' ') > 0)
      name = name.slice(0, name.indexOf(' '));
    Meteor.users.update({_id: Meteor.userId()}, { $set:{"profile.firstname": name}} )

  },
});


Template.mdArchiveAddress.helpers({
  shipTo: function () {
    return Meteor.user().profile.shipTo;    
  }
});


Template.mdArchiveName.helpers({
  openArchive: function() {
    var archiveId = Session.get('openArchiveId');
    return MdArchive.collection.findOne({_id: archiveId});
  }
});

Template.mdArchiveConfrim.helpers({
  openArchive: function() {
    var archiveId = Session.get('openArchiveId');
    return MdArchive.collection.findOne({_id: archiveId});
  }
});


Template.mdArchiveName.events({
  'blur #archive-name': function(event, template) {
    var archiveId = Session.get('openArchiveId');
    MdArchive.collection.update({_id: archiveId}, {$set: {archiveName: event.currentTarget.value}});
    Session.set('archiveNameEdited', true);
  },
  'submit': function(e, t) {
    e.preventDefault();
    var archiveId = Session.get('openArchiveId');
    MdArchive.collection.update({_id: archiveId}, {$set: {archiveName: event.target[0].value}});
    Session.set('archiveNameEdited', true);
  }  
});

