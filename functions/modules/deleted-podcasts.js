const functions = require('firebase-functions');
const admin = require('firebase-admin');

var appAnalytics = require('./app-analytics');

var updateAppAnalytics = new appAnalytics();

// on podcasts delete
exports.deletedPodcasts = functions.database.ref('/podcasts/{podcastID}').onDelete((snap, context) => {
  // Get Firebase object
  const deletedItem = snap.val();
  console.log('deleted: ', deletedItem);
  var journalUserID = deletedItem.userID;
  var notificationItemID = deletedItem.key;
  var companyID = deletedItem.companyID;
  var notificationType = deletedItem.podcastDescription.toLowerCase();
  var status = deletedItem.status;

  if (status == "approved") {
    var notificationData = {
      notificationItemID: notificationItemID,
      notificationType: notificationType,
      journalUserID: journalUserID,
      companyID: companyID
    }

    // Add count to users analytics for thoughts
    let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('podcasts');
    let countItem = countItems.transaction(function (current) {
      if ((current == 0) || (current == undefined)) {
        return current
      } else {
        return (current || 0) - 1;
      }

    });
  }

});