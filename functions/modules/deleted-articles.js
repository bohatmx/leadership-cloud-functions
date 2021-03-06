const functions = require('firebase-functions');
const admin = require('firebase-admin');

var appAnalytics = require('./app-analytics');

var updateAppAnalytics = new appAnalytics();

// on articles delete
exports.deletedArticles = functions.database.ref('/news/{newsID}').onDelete((snap, context) => {
  // Get Firebase object
  const deletedItem = snap.val();
  console.log('deleted: ', deletedItem);
  var journalUserID = deletedItem.journalUserID;
  var notificationItemID = snap.key;
  var companyID = deletedItem.companyID;
  var status = deletedItem.status;

  if (status == "approved") {
    var notificationData = {
      notificationItemID: notificationItemID,
      notificationType: 'article',
      journalUserID: journalUserID,
      companyID: companyID
    }

    // Add count to users analytics for thoughts
    let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('articles');
    let countItem = countItems.transaction(function (current) {
      if ((current == 0) || (current == undefined)) {
        return current
      } else {
        return (current || 0) - 1;
      }
    });

    updateAppAnalytics.removeposts(notificationData);

  }
});