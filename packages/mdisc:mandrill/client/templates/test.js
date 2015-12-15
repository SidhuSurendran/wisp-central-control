Template.mdMandrillTest.events({
  'click a#btn-new-account': function(e, t) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    if (email != '') {
      Meteor.call('sendEmail','new-account',email);
      console.log('new-account email sent');
    } else {
      console.log('email address not set');
    }
  },
  'click a#btn-payment': function(e, t) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    if (email != '') {
      Meteor.call('sendEmail','payment-receipt',email);
      console.log('payment-receipt email sent');
    } else {
      console.log('email address not set');
    }
  },
  'click a#btn-data': function(e, t) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    if (email != '') {
      Meteor.call('sendEmail','concierge-data-received',email);
      console.log('concierge-data-received email sent');
    } else {
      console.log('email address not set');
    }
  },
  'click a#btn-ship': function(e, t) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    if (email != '') {
      Meteor.call('sendEmail','concierge-order-shipped',email);
      console.log('concierge-order-shipped email sent');
    } else {
      console.log('email address not set');
    }
  },
  'click a#btn-prepare': function(e, t) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    if (email != '') {
      Meteor.call('sendEmail','concierge-preparing-monthly-archive',email);
      console.log('concierge-preparing-monthly-archive email sent');
    } else {
      console.log('email address not set');
    }
  },
  'click a#btn-pass': function(e, t) {
    e.preventDefault();

    var email = document.getElementById('email').value;
    if (email != '') {
      Meteor.call('sendEmail','forgot-password',email);
      console.log('forgot-password email sent');
    } else {
      console.log('email address not set');
    }
  },
});
