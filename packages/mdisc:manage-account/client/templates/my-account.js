Template.mdMyAccount.helpers({
  orders: function() {
    return MdArchive.collection.find().fetch();
  },
  user: function() {
    return Meteor.user();
  },
  showTrack: function() {
    if(Session.get('showTrack'))
      return true;
    else
      return false;
  }
});

Template.mdMyAccount.events({
  'click #btSignOut':function(event){
     event.preventDefault();
     Meteor.logout();
  }
});

Template.mdMyAccountOrder.helpers({
  show: function(status) { 
    if (status == 'Open') {
      return false;
    } else {
      return true;
    }
  },
  shipStatus: function(status) {
    var stats=MdArchive.collection.find().fetch();
      if(stats[0].status=="Shipped") {
        console.log(stats[0].status);
        return true;
      } else {
       return false
      } 
  },
  isEqual: function(status,checkstat){
    if(status==checkstat)
      return true;
    else
      return false;
  }
});

Template.mdMyAccountOrder.events({
  'click a': function(e,t){
     Session.set('Spinner',true);
     Session.set('track',false);
     Session.set('showTrack',true);
     Session.set('trackerr',false);
     trackCode = $(e.target).attr("value");
     Meteor.call('mdEasypostTrackShipment',trackCode,function(err,response)
       {
        if(response) {
           Session.set('Spinner',false);
           Session.set('trackerr',false);
           Session.set('track',response);
         }
         else
         {
           Session.set('Spinner',false);
           Session.set('trackerr',true);
         }
                
       });
   
    
     $('#mdTrack').modal('show');
     
  }
});


Template.mdMyAccountShippingForm.helpers({
  user: function() {
    return Meteor.user();
  }
});

Template.mdMyAccountShippingForm.events({
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

Template.mdMyAccountUserForm.rendered=function()
{
  Session.set('pwdsuccess',false);
  Session.set('passmatch',false);
  Session.set('pwdstrength',false);
  Session.set('pwdstrengths',false); 
};

Template.mdMyAccountUserForm.helpers({
  userdet:function()
  {
    Meteor.subscribe('userlog',Meteor.userId());
    var data = Meteor.users.findOne({_id: Meteor.userId()});
    return data;
  },
  showcurrerror:function()
  {    
    return Session.get('showcurr');
  },
  showpwderror:function()
  {    
    return Session.get('passmatch');
  },
  succmessage:function()
  {
    return Session.get('pwdsuccess');
  },
  passwdstrength:function()
  {
    return Session.get('pwdstrength');
  },
  passwdstrengths:function()
  {
    return Session.get('pwdstrengths');
  }
  
});

Template.mdMyAccountUserForm.events({
  'click #btChangePassword':function(event){
     event.preventDefault();
     var password=$('[name=txtNewpassword]').val();
    
     if(($('[name=txtNewpassword]').val()!=$('[name=txtRepassword]').val())
            ||($('[name=txtNewpassword]').val()=='')||($('[name=txtRepassword]').val()=='')) {
        Session.set('passmatch',true);
        Session.set('pwdsuccess',false);
       }
     else if((password.length < 6)||(password.length >20)) {
       Session.set('passmatch',false);
       Session.set('pwdstrength',true);
     }
     else if(!(password.match(/([a-zA-Z])/)) || !(password.match(/([0-9])/))) {
       Session.set('passmatch',false);
       Session.set('pwdstrength',false);
       Session.set('pwdstrengths',true);
     }
     else {
       Session.set('pwdstrengths',false);    
       var email = $('[name=txtEmail]').val();
       var oldPassword = $('[name=txtPassword]').val();
       var newPassword = $('[name=txtNewpassword]').val();
        
       Accounts.changePassword(oldPassword,newPassword, function(err){
         if(err){
           Session.set('showcurr',true);
         }
         else {
           Session.set('showcurr',false);
           Session.set('pwdsuccess',true);
         }
       })
        
     }
  }
});

Template.mdMyAccountDataPermissions.helpers({
  isConnected: function() {
    Session.set('googleChecking', true);

    Meteor.call('mdCloudServiceIsConnected', 'Google Photos', function (err, res) {
      if (!err) {
        Session.set('googleConnected', true);
      } else {
        Session.set('googleConnected', false);
      }
      Session.set('googleChecking', false);
    });
    
    if (Session.get('googleConnected')===true) {
      return true;
    } else {
      return false;
    }
  }
});

Template.mdMyAccountDataPermissions.events({
  'click #connectNow': function (e) {
    e.preventDefault();
    
    googlePhotos.requestCredential();
  }
});



Template.mdTrack.rendered=function(){
  Session.set('trackerr',false);
  Session.set('track',false);
  Session.set('Spinner',true);
};

Template.mdTrack.helpers({
  trackerror: function() {
    return Session.get('trackerr');
  },
  trackdata: function() {
    trackdata = Session.get('track');
    return trackdata;
  },
  showspinner: function() {
    if(Session.get('Spinner')) {
      return true;
    }
    else {
      return false;
    }
  },
  statusFormat: function(status){
    if(status=="in_transit")
      return "Dispatched";
    else
      return status;
  },
  formatdeliverydate: function(est_delivery_date) {
    var deliverydate = WtDateFormat(est_delivery_date, "shortDate");
    return deliverydate;
  },
  formatlastupdate: function(updated_at) {
    var lastupdate = WtDateFormat(updated_at, "shortDate");
    return lastupdate;
  }
});