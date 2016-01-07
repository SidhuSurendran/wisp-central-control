ChargeBeeAPI = {};

ChargeBee = Npm.require('chargebee');
Future = Npm.require('fibers/future');

ChargeBee.configure({
  site: Meteor.settings.chargebee.site,
  api_key: Meteor.settings.chargebee.apiKey
});

ChargeBeeAPI.createCustomer = function (firstName, lastName, billingAddress, callback) {
  if (!firstName || !lastName || !billingAddress) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee create customer - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  ChargeBee.customer.create({
    first_name: firstName,
    last_name: lastName,
    billing_address: {
      first_name: billingAddress.firstName,
      last_name: billingAddress.lastName,
      line1: billingAddress.address1,
      line2: billingAddress.address2,
      city: billingAddress.city,
      state: billingAddress.state,
      zip: billingAddress.zip,
      country: billingAddress.country
    }
  }).request(callback);
};

ChargeBeeAPI.updateCustomer = function (customerId, firstName, lastName, callback) {
  if (!customerId || !firstName || !lastName) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee update customer - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  ChargeBee.customer.update(customerId, {
    first_name: firstName,
    last_name: lastName
  }).request(callback);
};

ChargeBeeAPI.updateBillingInfoForCustomer = function (customerId, billingAddress, callback) {
  if (!customerId || !billingAddress) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee update billing info - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  ChargeBee.customer.update_billing_info(customerId, {
    billing_address: {
      first_name: billingAddress.firstName,
      last_name: billingAddress.lastName,
      line1: billingAddress.address1,
      line2: billingAddress.address2,
      city: billingAddress.city,
      state: billingAddress.state,
      zip: billingAddress.zip,
      country: billingAddress.country
    }
  }).request(callback);
};

ChargeBeeAPI.updateCardForCustomer = function (customerId, cardDetails, callback) {
  if (!customerId || !cardDetails) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee update card info - Invalid parameters.');
  }
  if (cardDetails && (!cardDetails.number || !cardDetails.expMonth || !cardDetails.expYear || !cardDetails.cvv)) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee update card info - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  ChargeBee.card.update_card_for_customer(customerId, {
    gateway: Meteor.settings.chargebee.gateway,
    number: cardDetails.number,
    expiry_month: cardDetails.expMonth,
    expiry_year: cardDetails.expYear,
    cvv: cardDetails.cvv
  }).request(callback);
};

ChargeBeeAPI.createSubscriptionForCustomer = function (customerId, planId, callback) {
  if (!customerId || !planId) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee create subscription - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  
  var myFuture = new Future();
  ChargeBeeAPI.listSubscriptionsForCustomer(customerId, 100, function (err, result) {
    if (err) {
      myFuture.return({status: "error", msg: err.message});
    } else {
      var hasActiveSubscription = "false";
      if (result.list && result.list.length>0) {
        for (var i = 0; i < result.list.length; i++) {
          if (result.list[i].subscription.status && result.list[i].subscription.status == 'active') {
            hasActiveSubscription = "true";
          }
        }
      }
      myFuture.return({status: "success", data: hasActiveSubscription});
    }
  });
  var result = myFuture.wait();
  if (result.status == "error") {
    throw new Meteor.Error("chargebee-error", 'An error has occurred.');
  } else {
    if (result.data == "true") {
      throw new Meteor.Error("chargebee-error", 'You already have an active subscription.');
    } else {
      ChargeBee.subscription.create_for_customer(customerId, {
        plan_id: planId
      }).request(callback);
    }
  }
};

ChargeBeeAPI.listSubscriptionsForCustomer = function (customerId, limit, callback) {
  if (!customerId || !limit) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee list subscription - Invalid parameters.');
  }
  if (limit && (limit<1 || limit>100)) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee list subscription - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  ChargeBee.subscription.subscriptions_for_customer(customerId, {
    limit: limit
  }).request(callback);
};

ChargeBeeAPI.cancelSubscription = function (subscriptionId, callback) {
  if (!subscriptionId) {
    throw new Meteor.Error("chargebee-error", 'ChargeBee cancel subscription - Invalid parameters.');
  }
  if (callback && typeof(callback)!=="function") {
    throw new Meteor.Error("chargebee-error", 'Callback should be a function.');
  }
  ChargeBee.subscription.cancel(subscriptionId).request(callback);
};
