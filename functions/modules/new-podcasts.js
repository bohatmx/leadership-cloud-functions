const functions = require('firebase-functions');
const admin = require('firebase-admin');

var handleNotifications = require('./handle-notifications');
var userToken = new handleNotifications();

// on podcasts create
exports.newPodcasts = functions.database.ref('/podcasts/{podcastID}').onCreate((snap, context) => {
    // Get Firebase object
    var podcast = snap.val();
    // Specify Algolia's objectID using the Firebase object key
    podcast.objectID = snap.key;
  
    console.log("new podcast: ", podcast);
  
    // get title and subtitle from thought object
    var company_status = podcast.company_status;
  
    if ((company_status == "general_true") || (company_status == "general_false")) {
  
      var title = podcast.title;
      var podcastDescription = podcast.podcastDescription;
  
      var journalUserID = podcast.userID;
      var journalUserName = podcast.userName;
      var notificationDate = Date.now();
      var notificationItemID = snap.key;
      var photoURL = "";
      var companyID = podcast.companyID;
      var companyName = podcast.companyName;
  
      var updateOwner = {};
      updateOwner['podcasts/' + snap.key + '/postOwner'] = journalUserID;
      admin.database().ref().update(updateOwner).then(postsupdate => {
        console.log('updateOwner podcasts');
      }).catch(posts_err => {
        console.log('updateOwner podcasts error');
      })
  
      if (podcast.photoURL != undefined || podcast.photoURL != "") {
        photoURL = podcast.photoURL;
      } else {
        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }
  
      if (photoURL == undefined) {
        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }
  
      var notificationData = {
        notificationItemID: notificationItemID,
        notificationType: 'podcast',
        notificationMsg: journalUserName + ' posted a ' + podcastDescription.toLowerCase() + ' about: "' + title + '"',
        journalUserID: journalUserID,
        journalUserName: journalUserName,
        photoURL: photoURL,
        notificationDate: notificationDate,
        seen: false,
        opened: false,
        companyID: companyID,
        companyName: companyName
      }
  
      console.log('notificationData', notificationData);
  
      // Prepare email notification
      let msgPlain = journalUserName + ' posted a ' + podcastDescription.toLowerCase() + ' about: ' + title
      msgPlain += '';
      msgPlain += 'Best Regards,';
      msgPlain += 'Global Leadership Platform.';
  
      var subject = journalUserName + ' shared a new ' + podcastDescription.toLowerCase();
  
      // daily thought type status - 1_approved (internal approved), 2_approved (external approved)
      var dailyThoughtType_status = podcast.dailyThoughtType_status;
  
      console.log("dailyThoughtType_status: " + dailyThoughtType_status);
  
      // start external/global approved 2_approved
      if (dailyThoughtType_status === "2_approved") {
        var all = true;
  
        var options = {
          "subject": subject,
          "msgTxt": msgPlain,
          "msgHTML": "",
          "photoURL": photoURL,
          "notificationMsg": journalUserName + ' posted a ' + podcastDescription.toLowerCase() + ' about: ' + title,
          "userName": journalUserName,
          "notificationURL": 'filtered-podcasts?fromemail=true/#/' + notificationItemID,
          "userID": journalUserID,
          "companyID": companyID,
          "all": all,
          notificationType: 'podcast',
          postID: notificationItemID
        }
  
        // Add count to users analytics for thoughts
        let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('podcasts');
        let currentCount = countItems.transaction(function (current) {
          return (current || 0) + 1;
        });
  
        var newNotification = userToken.createNotifications(all, options, notificationData);
        return true;
  
      } // end of 2_approved
      // start internal approved (1_approved)
      if (dailyThoughtType_status === "1_approved") {
        var all = false;
  
        var options = {
          "subject": subject,
          "msgTxt": msgPlain,
          "msgHTML": "",
          "photoURL": photoURL,
          "notificationMsg": journalUserName + ' posted a ' + podcastDescription.toLowerCase() + ' about: ' + title,
          "userName": journalUserName,
          "notificationURL": 'filtered-podcasts?fromemail=true/#/' + notificationItemID,
          "userID": journalUserID,
          "companyID": companyID,
          "all": all,
          notificationType: 'podcast',
          postID: notificationItemID
        }
  
        // Add count to users analytics for thoughts
        let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('podcasts');
        let currentCount = countItems.transaction(function (current) {
          return (current || 0) + 1;
        });
  
        var newNotification = userToken.createNotifications(all, options, notificationData);
  
        return true;
      }
      // end of 1_approved
  
    }
  
  });