Template.mdMyAccountYourSubscription.helpers({
  checking: function () {
    return Session.get('cb_fetching_subscription');
  },
  hasSubscription: function () {
    return Session.get('cb_has_subscription');
  },
  getSubscriptions: function () {
    return Session.get('cb_subscriptions');
  },
  formatDate: function (timestamp) {
    var d = new Date(timestamp*1000);
    return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear().toString().substr(2);
  },
  planName: function (planId) {
    return MdChargeBee.planIdToName(planId);
  },
  planAmount: function (planId) {
    return MdChargeBee.planIdToAmount(planId);
  },
  sub: function () {
    return MdArchive.subscription.findOne({owner: Meteor.userId()});
  }  
});

Template.mdMyAccountYourSubscription.events({
  'click .subCancelBtn': function (e) {
    e.preventDefault();
    Session.set('cancel_subscription', this.subscription);
    Session.set('cancel_subscription_confirmation', false);
    $('#confText').val('');
  }
});

Template.mdMyAccountYourSubscription.onRendered(function () {
  Session.set('cb_has_subscription', false);
  Session.set('cb_fetching_subscription', false);
  Session.set('cb_subscriptions', 'false');
  get_subscriptions();
});


function get_subscriptions() {
  Session.set('cb_fetching_subscription', true);
  Meteor.call('mdChargeBeeListSubscriptions', function (err, res) {
    Session.set('cb_fetching_subscription', false);
    if (!err) {
      var hasActiveSubscription = false;
      var activeSubscriptions = new Array;
      if (res && res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          if (res[i].subscription.status && res[i].subscription.status == 'active') {
            hasActiveSubscription = true;
            activeSubscriptions.push(res[i]);
          }
        }
      }
      if (hasActiveSubscription) {
        Session.set('cb_has_subscription', true);
        Session.set('cb_subscriptions', activeSubscriptions);
      }
    }
  });
}
