// Server side only methods
Meteor.methods({
  getArchiveById: function (archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    return MdArchive.collection.findOne({_id: archiveId});
  },
  getMostRecentArchiveByUserId: function (userId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    return MdArchive.collection.findOne({$query: {owner: userId}, $orderby: {createdAt: -1}});
  },  
  getArchiveByTrackingId: function (trackingId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    return MdArchive.collection.findOne({trackingId: trackingId});
  },
  getArchiveFilesById: function (filesId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    return MdArchive.files.findOne({_id: filesId});    
  },
  setArchiveStatus: function (status, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {status: status}});
  },
  setArchiveSize: function (size, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {size: size}});
  },
  setArchiveDisks: function (disks, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {disks: disks}});
  },
  setArchiveDiskType: function (type, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {diskType: type}});
  },
  setArchiveShippingLabel: function (url, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {shippingLabel: url}});
  },
  setArchiveTrackingId: function (trackingId, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {trackingId: trackingId}});
  },
  setArchiveShipTo: function (address, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {shipTo: address}});
  },
  setArchiveTitle: function (title, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {title: title}});
  },
  setArchiveNasDir: function (dir, archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$set: {nasDir: dir}});
  },
  pushArchiveScanned: function (archiveId, diskIndex) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$push: {scanned: {diskIndex: diskIndex, time: new Date(), userId: Meteor.userId()}}});
    return MdArchive.collection.findOne({_id: archiveId});
  },
  pushArchiveShippingScanned: function (archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.collection.update({_id: archiveId}, {$push: {shippingScanned: {time: new Date(), userId: Meteor.userId()}}});
    return MdArchive.collection.findOne({_id: archiveId});
  },
  getArchiveShippingLabel: function (archiveId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var archive = MdArchive.collection.findOne({_id: archiveId});
    if (archive.shippingLabel) {
      return archive;
    } else {
      var toAddress = {
        name: archive.shipTo.name,
        street1: archive.shipTo.address,
        street2: archive.shipTo.address2,
        city: archive.shipTo.city,
        state: archive.shipTo.state,
        zip: archive.shipTo.zip
      };
      var fromAddress = {
        name: "MDisc",
        street1: "915 S 500 E",
        city: "AMERICAN FORK",
        state: "UT",
        zip: "84003"
      };
      var parcel = {
        length: 7,
        width: 5,
        height: 0.5,
        weight: 6
      };
      var shipment = Meteor.call('mdEasypostCreateShipment', toAddress, fromAddress, parcel);
      if (shipment) {
        Meteor.call('setArchiveShippingLabel', shipment.postage_label.label_url, archiveId);
        Meteor.call('setArchiveTrackingId', shipment.tracking_code, archiveId);
        return MdArchive.collection.findOne({_id: archiveId});
      } else {
        throw new Meteor.Error("easypost-error", "Failed to create shipping label.");
      }
    }
  },
  getArchiveLastShippedDate: function (service, userId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var archive = MdArchive.collection.findOne({$query: {service: service, owner: userId, status: 'Shipped'}, $orderby: {createdAt: -1}});
    if (archive) {
      var date = new Date(archive.createdAt);
      return date.getTime(); // return epoch
    } else {
      return null;
    }
  },
  // type = Full or Monthly
  createCloudArchive: function (service, type, forUserId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var subscription = MdArchive.subscription.findOne({owner: forUserId});
    var id = MdArchive.collection.insert({
      type: type,
      version: '0.0.2',
      service: service,
      status: 'Ordered',
      size: 'Unknown',
      diskType: 'DVD',
      disks: 'Unknown',
      archiveName: subscription.archiveName,
      shipTo: subscription.shipTo,
      archiveType: type + ' Archive (' + service + ')'
    });
    // update the ownerId
    MdArchive.collection.update({_id: id}, {$set:{owner: forUserId}});

    // Get a unique order number and update the archive
    Meteor.call('mdCreateOrderNumber', function(err, res) {
        var orderNumber;
        if (err) {
            orderNumber = 'DEFAULT';
        } else {
            orderNumber = res;
        }
        MdArchive.collection.update({_id: id}, {$set: {orderNumber: orderNumber}});
    });

    // start the download
    Meteor.call('downloadArchive', id);
    
  },
  increaseAvailableArchives: function (userId, numArchives) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.subscription.update({owner: userId}, {
      $inc: {availableArchives: numArchives},
    });
  },
  decreaseAvailableArchives: function (userId, numArchives) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    MdArchive.subscription.update({owner: userId}, {
      $inc: {availableArchives: -numArchives},
    });
  },
  getAvailableArchives: function (userId) {
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) throw new Meteor.Error(401, "Not authorized"); // Check if calling user is admin
    var have = 0;
    var subscription = MdArchive.subscription.findOne({owner: userId});
    if (subscription) {
      if (subscription.availableArchives) {
        have = Number(subscription.availableArchives);
      }
    }
    return have;
  }
});