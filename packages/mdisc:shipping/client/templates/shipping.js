Template.mdShipping.helpers({
    qrCode: function() {
        return processScannedData(qrScanner.message());
    },
    lastScanned: function() {
        return Session.get('lastScanned');
    },
    scannedDiskCount: function() {
        var scannedDisks = Session.get('scannedDisks');
        return scannedDisks?scannedDisks.length:0;
    },
    diskCountKnown: function(disks) {
        return disks !== 'Unknown';
    },
    scannedDisks: function(count) {
        var res = new Array();
        var scannedDisks = Session.get('scannedDisks');
        if (!scannedDisks) {
            scannedDisks = new Array();
        }
        for (var i=0;i<count;i++) {
            var index = i+1;
            var status = 0;
            if (scannedDisks.indexOf(i.toString())>-1) {
                status = 1;
            }
            res.push({index: index, status: status});
        }
        return res;
    },
    scanCompleted: function(count) {
        var scannedDisks = Session.get('scannedDisks');
        if (!scannedDisks) {
            return 0;
        }
        return count === scannedDisks.length;
    },
    formatDate: function (timestamp) {
        var d = new Date(timestamp);
        return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
    },
    progressBarWidth: function (scannedDisks, totalDisks) {
        return Math.ceil(scannedDisks*100/totalDisks);
    }
});

Template.mdShipping.onRendered(function() {
    var lastScanned = "";
    var scannerEnabled = 1;
    qrScanner.on('scan', function(err, result) {
        if (!err && scannerEnabled) {
            result = processScannedData(result);
            if (result != lastScanned) {
                lastScanned = result;
                try {
                    var qrdata = JSON.parse(result);
                } catch (e) {
                    //Do nothing
                }
                if (qrdata) {
                    Meteor.call("getArchiveById", qrdata.id, function(err, res) {
                        if (!err && res) {
                            scanIndications();
                            var lastScanned = Session.get('lastScanned');
                            var scannedDisks = Session.get('scannedDisks');
                            if (!scannedDisks) {
                                scannedDisks = new Array();
                            }
                            if (lastScanned && lastScanned.archive && lastScanned.archive._id == res._id) {
                                if (scannedDisks.indexOf(qrdata.n)<0) {
                                    scannedDisks.push(qrdata.n);
                                }
                            } else {
                                scannedDisks = new Array();
                                scannedDisks.push(qrdata.n);
                                WtGrowl.success("New Session Started: " + res._id);
                            }
                            Session.set('lastScanned', {archive: res, disc: qrdata.n});
                            Session.set('scannedDisks', scannedDisks);
                            Meteor.call("pushArchiveScanned", qrdata.id, qrdata.n, function(err, res) {
                                if (!err && res) {
                                    var lastScanned = Session.get('lastScanned');
                                    if (lastScanned && lastScanned.archive) {
                                        lastScanned.archive = res;
                                        Session.set('lastScanned', lastScanned);
                                    }
                                }
                            });
                            
                            if (scannedDisks.length == res.disks) {
                                scannerEnabled = 0;
                                WtGrowl.success("The shipping label will be generated and printed shortly.");
                                Meteor.call("getArchiveShippingLabel", res._id, function (err, res) {
                                    if (!err) {
                                        Meteor.call("setArchiveStatus", "Docked", res._id);
                                        ImgToPdf.print(res.shippingLabel, function () {
                                            scannedDisks = new Array();
                                            Session.set('scannedDisks', scannedDisks);
                                            lastScanned = "";
                                            Session.set('lastScanned', lastScanned);
                                            scannerEnabled = 1;
                                        });
                                    } else {
                                        WtGrowl.fail(err.reason);
                                        scannedDisks = new Array();
                                        Session.set('scannedDisks', scannedDisks);
                                        lastScanned = "";
                                        Session.set('lastScanned', lastScanned);
                                        scannerEnabled = 1;
                                    }
                                });
                            }
                            
                        } else {
                            scanError();
                        }
                    });
                } else {
                    scanError();
                }
            }
        }
    });
});

Template.mdShipping.onDestroyed(function() {
    Session.set('lastScanned', false);
    Session.set('scannedDisks', false);
});
