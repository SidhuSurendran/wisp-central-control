Future = Npm.require('fibers/future');

Meteor.methods({
  addCredential: function(service, credentialToken, credentialSecret) {
    var credentialDetail = OAuth.retrieveCredential(credentialToken, credentialSecret);
    var credential = MdCloudServices.credentials.findOne({owner: this.userId, service: service});
    if (credential) {
      MdCloudServices.credentials.update({_id: credential._id}, {$set: {service: service, credentialToken: credentialToken, credentialSecret: credentialSecret, credential: credentialDetail}});
    } else {
      MdCloudServices.credentials.insert({service: service, credentialToken: credentialToken, credentialSecret: credentialSecret, credential: credentialDetail});
    }
  },
  getAccountSize: function(service) {
    var userId = this.userId;
    var estimatedSize;

    switch (service) {
      case 'Google Photos':
        var credential = MdCloudServices.credentials.findOne({owner: userId, service: service});
        if (credential) {
          //check if token has expired.
          var now = new Date();
          var expDate = new Date(credential.credential.serviceData.expiresAt);
          var timeLeft = expDate - now;
          if (timeLeft < 60000) {
            // expired or less than a minute remaining
            //credential = MdCloudServices.renewCredential(credential);              
          }
          var accessToken = credential.credential.serviceData.accessToken;
          if (accessToken) {
            var client = new gPhotos(accessToken);
            var myFuture = new Future();
            client.getQuota(Meteor.bindEnvironment(function(err, res) {
              if (err) myFuture.return(null);
              estimatedSize = res.feed.gphoto$quotacurrent.$t;
              //console.log(estimatedSize);
              myFuture.return(estimatedSize);
            }));
            return myFuture.wait();
          }
        }
        break;
    }
    return estimatedSize;
  },
  getRecentPhotos: function(service) {
    var userId = this.userId;
    switch (service) {
      case 'Google Photos':
        var credential = MdCloudServices.credentials.findOne({owner: userId, service: service});
        if (credential) {
          //check if token has expired.
          var now = new Date();
          var expDate = new Date(credential.credential.serviceData.expiresAt);
          var timeLeft = expDate - now;
          if (timeLeft < 60000) {
            // expired or less than a minute remaining
            //credential = MdCloudServices.renewCredential(credential);              
          }
          var accessToken = credential.credential.serviceData.accessToken;
          if (accessToken) {
            var client = new gPhotos(accessToken);
            var myFuture = new Future();
            client.getRecent(Meteor.bindEnvironment(function(err, res) {
              if (err) myFuture.return([]);
              var len = res.feed.entry.length;
              var urls = [];
              for (var x = 0; x < len; x++) {
                //console.log(res.feed.entry[x].content.src);
                urls.push(res.feed.entry[x].content.src);
              }
              myFuture.return(urls);
            }));
            return myFuture.wait();
          }
        }
        break;
    }
    return [];
  },
  updateRecentPhotos: function(service) {
    var userId = this.userId;
    switch (service) {
      case 'Google Photos':
        var credential = MdCloudServices.credentials.findOne({owner: userId, service: service});
        if (credential) {
          //check if token has expired.
          var now = new Date();
          var expDate = new Date(credential.credential.serviceData.expiresAt);
          var timeLeft = expDate - now;
          if (timeLeft < 60000) {
            // expired or less than a minute remaining
            //credential = MdCloudServices.renewCredential(credential);              
          }
          var accessToken = credential.credential.serviceData.accessToken;
          if (accessToken) {
            var client = new gPhotos(accessToken);
            client.getRecent(Meteor.bindEnvironment(function(err, res) {
              if (err) return false;

              var len = res.feed.entry.length;
              var urls = [];
              for (var x = 0; x < len; x++) {
                //console.log(res.feed.entry[x].content.src);
                urls.push(res.feed.entry[x].content.src);
              }
              var doc = MdCloudServices.recentPhotos.findOne({owner: userId});
              if (doc) {
                MdCloudServices.recentPhotos.update({_id: doc._id}, {$set: {urls: urls}});
              } else {
                MdCloudServices.recentPhotos.insert({urls: urls});                
              }
            }));
          }
        }
        break;
    }
  },
  initAutoCloudArchive: function(service, archiveId) {
    // Get all the files to be used in the archive
    var userId = this.userId;
    console.log(archiveId);
    switch (service) {
      case 'Google Photos':
        var credential = MdCloudServices.credentials.findOne({owner: userId, service: service});
        if (credential) {
          var accessToken = credential.credential.serviceData.accessToken;
          if (accessToken) {

            var photos = [];
            var gSize = 1000; // max 1000
            var client = new gPhotos(accessToken);
            // Get all the albumns
            // TODO: This process might need to be off loaded to a job server.
            client.getAlbums(Meteor.bindEnvironment(function (err, res) {
              if (err) return false;  // TODO: restart the init process
              var estimatedSize = res.feed.gphoto$quotacurrent.$t;
              var len = res.feed.entry.length;
              for (var x=0; x < len; x++) {
                var id = res.feed.entry[x].gphoto$id.$t;
                var numPhotos = res.feed.entry[x].gphoto$numphotos.$t;
                var groups = Math.floor((Number(numPhotos) + gSize) / gSize);

                // break albums into smaller sub groups
                // max is groups of 1000
                for (var g = 0; g < groups; g++) {
                  var aName = res.feed.entry[x].gphoto$name.$t;
                  if (groups > 1) {
                    var tag = (g + 1) * gSize;
                    aName = aName + '-' + tag;
                  }
                  var album = {
                    name: aName,
                    files: []
                  }

                  // Process albumns one at a time to lower server overhead
                  Async.runSync(function (done) {
                    client.getAlbum(id, g * gSize, gSize, function (err, res) {
                      if (err) {
                        // try again
                        console.log('Error Getting Album: ' + err);
                        g--;
                        done();
                      }
                      var len = res.feed.entry.length
                      var prevName;
                      var ver;
                      for (var y=0; y < len; y++) {

                        //console.log(res.feed.entry[y]);
                        //console.log(res.feed.entry[y].media$group.media$content);
                        //console.log('-----------------------------------------------------------------------------');

                        var date = res.feed.entry[y].updated.$t;
                        var name = res.feed.entry[y].title.$t;
                        var url = res.feed.entry[y].media$group.media$content[0].url;
                        var type = 'img';

                        // check extention on file name
                        if (!name.lastIndexOf('.')) {
                          // add extention from url if missing
                          name = name + '.' + url.substr(url.lastIndexOf('.')+1)
                        }

                        //var size = res.feed.entry[y].gphoto$size.$t;
                        //estimatedSize += Number(size);

                        // basic fix for duplicate names.
                        // TODO: improve this.
                        if (prevName == name) {
                          name = "v" + ver + "_" + name;
                        } else {
                          ver = 1;
                          prevName = name;
                        }

                        for (var v=0; v < res.feed.entry[y].media$group.media$content.length; v++) {
                          if (res.feed.entry[y].media$group.media$content[v].medium == 'video') {
                            url = res.feed.entry[y].media$group.media$content[v].url;
                            type = 'vid';
                          }
                        }


                        // Add this photo/video to the list
                        album.files.push({
                          name:   name,
                          url:    url,
                          type:   type,
                        });
                      }
                      photos.push(album);
                      done();
                    });
                  });
                }
              }
              MdArchive.addFileData(archiveId, photos, estimatedSize);
              console.log('Archive Init Done: ' + archiveId);
              console.log('Estimated Size: ' + estimatedSize);
            }));
          }
        }
        break;
    }
  }  
});