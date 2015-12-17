var easypost = Easypost(Meteor.settings.easypost.apiKey);
Future = Npm.require('fibers/future');
exec = Npm.require('child_process').exec;
// verify address
Meteor.methods({
    mdEasypostVerifyAddress: function(fromAddress) {

        var future = new Future();
        easypost.Address.create(fromAddress, function(err, fromAddress) {
            fromAddress.verify(function(err, response) {
                var verifiedAddress;
                if (err) {
                    console.log('Address is invalid.');

                    future.return(response.message);
                } else if (response.message !== undefined && response.message !== null) {
                    console.log('Address is valid but has an issue: ',
                            response.message);
                    verifiedAddress = response.address;
                    future.return(verifiedAddress);
                } else {
                    verifiedAddress = response.address;
                    
                    future.return(verifiedAddress);
                }

            });
        });
        return future.wait();
    },
    // set parcel


    mdEasypostSetParsel: function(length, width, height, weight) {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
        var future = new Future();
        easypost.Parcel.create({
            // predefined_package: "LargeFlatRateBox",
            // weight: 21.2
            'length': length,
            'width': width,
            'height': height,
            'weight': weight


        }, function(err, response) {
            if (err)
                console.log(err);
            else {
                console.log(response.id);
                future.return(response.id);
            }
        });
        return future.wait();
    },
    // create Rates
    mdEasypostShowRates: function(toAddress, fromAddress, pid) {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
        console.log(pid);
        var future = new Future();
        easypost.Shipment.create({
            'to_address[id]': toAddress,
            'from_address': fromAddress,
            '[parcel][id]': pid

        }, function(err, shipment) {
            if (err)
                console.log(err);
            else
            {
                var shippmentRates = shipment.rates;
               
                future.return(shippmentRates);
            }
        });
        return future.wait();
    },
    //Create rates without verified addresses
    mdEasypostShowRate: function(toAddress, fromAddress, pid) {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
        console.log(pid);
        var future = new Future();
        easypost.Shipment.create({
            'to_address': toAddress,
            'from_address': fromAddress,
            '[parcel][id]': pid

        }, function(err, shipment) {
            if (err)
                console.log(err);
            else
            {
                var shippmentRates = shipment.rates;
               
                future.return(shippmentRates);
            }
        });
        return future.wait();
    },
    //Create Shipment

    mdEasypostCreateShipmentLabel: function(rateId, shipId) {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
        var future = new Future();
        easypost.Shipment.retrieve({
            id: shipId
        }, function(err, shipment) {
           
            shipment.buy(
                    {
                        'rate[id]': rateId
                    },
            function(err, response)
            {
                if (err)
                {

                    console.log(err);
                }
                else {
                    console.log(shipment);
                    var shippmentlabel = shipment.postage_label.label_url;
                    future.return(shippmentlabel);
                   
                }

            });
        });

        return future.wait();
    },
    mdEasypostTrackShipment: function(trackId) {
        if (!Meteor.userId()) throw new Meteor.Error(401, "Not authorized"); // Check if user is logged in.
        var future = new Future();
        easypost.Tracker.create({
            tracking_code: trackId
        }, function(err, response) {
          future.return(response);
        });
        return future.wait();
    },
    
    mdEasypostCreateShipment: function (toAddress, fromAddress, parcel) {
        if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
        var future = new Future();
        easypost.Shipment.create({
            to_address: toAddress,
            from_address: fromAddress,
            parcel: parcel
        }, function (err, shipment) {
            if (!err) {
                shipment.buy({rate: shipment.lowestRate(['USPS', 'ups'])}, function (err, shipment) {
                    if (!err) {
                        future.return(shipment);
                    } else {
                        future.return(false);
                    }
                });
            }
        });
        return future.wait();
    }
});