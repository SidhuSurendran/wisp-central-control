Meteor.methods({
  //Creates a new ChargeBee customer if current user does not have a customer entry.
  //Updates the customer entry if the current user already has a ChargeBee customer entry.
  //Returns customer object.
  mdChargeBeeCreateCustomer: function (firstName, lastName, billingAddress) {
    if (!this.userId) throw new Meteor.Error(401, "Not authorized"); // Check user logged in.
    var cbCustomer = MdChargeBee.customers.findOne({owner: this.userId});
    if (cbCustomer) {
      var myFuture = new Future();
      ChargeBeeAPI.updateCustomer(cbCustomer.customerId, firstName, lastName, Meteor.bindEnvironment(function (err, result) {
        if (err) {
          myFuture.return({status: "error", msg: err.message});
        } else {
          MdChargeBee.customers.update({customerId: result.customer.id}, {$set: {
            customer: result.customer
          }});
          myFuture.return({status: "success"});
        }
      }));
      var result = myFuture.wait();
      if (result.status == "error") {
        throw new Meteor.Error("chargebee-error", result.msg);
      }
      
      var myFuture = new Future();
      ChargeBeeAPI.updateBillingInfoForCustomer(cbCustomer.customerId, billingAddress, Meteor.bindEnvironment(function (err, result) {
        if (err) {
          myFuture.return({status: "error", msg: err.message});
        } else {
          MdChargeBee.customers.update({customerId: result.customer.id}, {$set: {
            customer: result.customer
          }});
          myFuture.return({status: "success"});
        }
      }));
      var result = myFuture.wait();
      if (result.status == "error") {
        throw new Meteor.Error("chargebee-error", result.msg);
      }
      return cbCustomer;
    } else {
      var myFuture = new Future();
      ChargeBeeAPI.createCustomer(firstName, lastName, billingAddress, Meteor.bindEnvironment(function (err, result) {
        if (err) {
          myFuture.return({status: "error", msg: err.message});
        } else {
          MdChargeBee.customers.insert({
            customerId: result.customer.id,
            customer: result.customer
          });
          myFuture.return({status: "success", data: result.customer});
        }
      }));
      var result = myFuture.wait();
      if (result.status == "error") {
        throw new Meteor.Error("chargebee-error", result.msg);
      }
      return result.data;
    }
  },
  
  mdChargeBeeUpdateCardInfo: function (customerId, cardDetails) {
    if (!this.userId) throw new Meteor.Error(401, "Not authorized"); // Check user logged in.
    var cbCustomer = MdChargeBee.customers.findOne({owner: this.userId});
    if (!cbCustomer) {
      throw new Meteor.Error("chargebee-error", 'ChargeBee customer does not exist');
    }
    if (!cardDetails || (cardDetails && (!cardDetails.number || !cardDetails.expMonth || !cardDetails.expYear || !cardDetails.cvv))) {
      throw new Meteor.Error("chargebee-error", 'ChargeBee update card info - Invalid parameters.');
    }
    cardDetails.number = MdAES.decrypt(cardDetails.number);
    cardDetails.expMonth = MdAES.decrypt(cardDetails.expMonth);
    cardDetails.expYear = MdAES.decrypt(cardDetails.expYear);
    cardDetails.cvv = MdAES.decrypt(cardDetails.cvv);
    var myFuture = new Future();
    ChargeBeeAPI.updateCardForCustomer(customerId, cardDetails, Meteor.bindEnvironment(function (err, result) {
      if (err) {
        myFuture.return({status: "error", msg: err.message});
      } else {
        myFuture.return({status: "success", data: result.card});
      }
    }));
    var result = myFuture.wait();
    if (result.status == "error") {
      throw new Meteor.Error("chargebee-error", result.msg);
    }
    return result.data;
  },
  
  mdChargeBeeCreateSubscription: function (customerId, planId) {
    if (!this.userId) throw new Meteor.Error(401, "Not authorized"); // Check user logged in.
    var cbCustomer = MdChargeBee.customers.findOne({owner: this.userId});
    if (!cbCustomer) {
      throw new Meteor.Error("chargebee-error", 'ChargeBee customer does not exist');
    }
    var myFuture = new Future();
    ChargeBeeAPI.createSubscriptionForCustomer(customerId, planId, Meteor.bindEnvironment(function (err, result) {
      if (err) {
        myFuture.return({status: "error", msg: err.message});
      } else {
        MdChargeBee.customers.update({customerId: result.customer.id}, {$set: {
          subscription: result.subscription
        }});
        myFuture.return({status: "success", data: result.subscription});
      }
    }));
    var result = myFuture.wait();
    if (result.status == "error") {
      throw new Meteor.Error("chargebee-error", result.msg);
    }
    return result.data;
  },
  
  mdChargeBeeListSubscriptions: function (userId) {
    // security check if called with a userId
    if (userId && !Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    if (!userId && !this.userId) throw new Meteor.Error(401, "Not authorized"); // Check user logged in.

    // use passed in userId if set.
    var _userId = userId || this.userId;

    var cbCustomer = MdChargeBee.customers.findOne({owner: _userId});
    if (!cbCustomer) {
      //throw new Meteor.Error("chargebee-error", 'ChargeBee customer does not exist');
      //Returns false instead of throwing an error indicating that subscription does not exist.
      return false;
    }
    var myFuture = new Future();
    //NOTE: Need to add code that hanldles more than 100 subscriptions.
    ChargeBeeAPI.listSubscriptionsForCustomer(cbCustomer.customerId, 100, Meteor.bindEnvironment(function (err, result) {
      if (err) {
        myFuture.return({status: "error", msg: err.message});
      } else {
        myFuture.return({status: "success", data: result.list});
      }
    }));
    var result = myFuture.wait();
    if (result.status == "error") {
      throw new Meteor.Error("chargebee-error", result.msg);
    }
    return result.data;
  },

  mdChargeBeeHasSubscription: function () {
    if (!this.userId) throw new Meteor.Error(401, "Not authorized"); // Check user logged in.

    // Check if user already has subscription
    var res = Meteor.call('mdChargeBeeListSubscriptions');
    var hasActiveSubscription = false;
    if (res && res.length>0) {
      for (var i=0; i<res.length; i++) {
        if (res[i].subscription.status && res[i].subscription.status == 'active') {
          hasActiveSubscription = true;
        }
      }
    }
    return hasActiveSubscription;
  },

  mdChargeBeeHasSubscriptionById: function (userId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin

    // Check if user already has subscription
    var res = Meteor.call('mdChargeBeeListSubscriptions', userId);
    var hasActiveSubscription = false;
    if (res && res.length>0) {
      for (var i=0; i<res.length; i++) {
        if (res[i].subscription.status && res[i].subscription.status == 'active') {
          hasActiveSubscription = true;
        }
      }
    }
    return hasActiveSubscription;
  },
  
  mdChargeBeeCancelSubscription: function (subscriptionId) {
    if (!this.userId) throw new Meteor.Error(401, "Not authorized"); // Check user logged in.
    var cbCustomer = MdChargeBee.customers.findOne({owner: this.userId});
    if (!cbCustomer) {
      throw new Meteor.Error("chargebee-error", 'ChargeBee customer does not exist');
    }
    
    //Check if subscription belongs to logged in user.
    var validSubscriptionId = false;
    var myFuture = new Future();
    //NOTE: Need to add code that hanldles more than 100 subscriptions.
    ChargeBeeAPI.listSubscriptionsForCustomer(cbCustomer.customerId, 100, Meteor.bindEnvironment(function (err, result) {
      if (err) {
        myFuture.return({status: "error", msg: err.message});
      } else {
        myFuture.return({status: "success", data: result.list});
      }
    }));
    var result = myFuture.wait();
    if (result.status == "error") {
      throw new Meteor.Error("chargebee-error", result.msg);
    }
    if (result.status == "success") {
      if (result.data && result.data.length > 0) {
        for (var i = 0; i < result.data.length; i++) {
          if (result.data[i].subscription.status && result.data[i].subscription.id == subscriptionId && result.data[i].subscription.status == 'active') {
            validSubscriptionId = true;
          }
        }
      }
    }
    
    if (validSubscriptionId) {
      var myFuture = new Future();
      ChargeBeeAPI.cancelSubscription(subscriptionId, Meteor.bindEnvironment(function (err, result) {
        if (err) {
          myFuture.return({status: "error", msg: err.message});
        } else {
          myFuture.return({status: "success", data: result});
        }
      }));
      var result = myFuture.wait();
      if (result.status == "error") {
        throw new Meteor.Error("chargebee-error", result.msg);
      }
      return result.data;
    } else {
      throw new Meteor.Error("chargebee-error", 'ChargeBee subscription id is not valid.');
    }
  },
  
  getChargeBeeCustomerByCustomerId: function (customerId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    return MdChargeBee.customers.findOne({customerId: customerId});
  },
  
  getSubscriptionByUserId: function (userId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    return MdArchive.subscription.findOne({owner: userId});
  },
  
  mdChargeBeePushInvoice: function (userId, invoice) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.subscription.update({owner: userId}, {
      $push: {invoices: invoice}
    });
  }
});