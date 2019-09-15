const functions = require('firebase-functions');
const admin = require('firebase-admin');

var handleNotifications = require('./handle-notifications');
var userToken = new handleNotifications();

// on create of new articles
exports.newArticles = functions.database.ref('/news/{newsID}').onCreate((snap, context) => {
  // Get Firebase object
  var article = snap.val();

  // Specify objectID using the Firebase object key
  article.objectID = snap.key;

  // get title and subtitle from thought object
  var body = article.title;
  var subtitle = article.subtitle;
  var journalUserID = article.journalUserID;

  var journalUserName = article.journalUserName;
  var notificationDate = Date.now();
  var notificationItemID = snap.key;
  var photoURL = "";
  var companyID = article.companyID;
  var companyName = article.companyName;

  // Add count to users analytics for thoughts
  let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('articles');
  let currentCount = countItems.transaction(function (current) {
    return (current || 0) + 1;
  });

  if (article.photoURL != undefined || article.photoURL != "") {
    photoURL = article.photoURL;
  } else {
    photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
  }

  if (photoURL == undefined) {
    photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
  }

  var notificationData = {
    notificationItemID: notificationItemID,
    notificationType: 'article',
    notificationMsg: journalUserName + ' posted an article about: "' + body + '"',
    journalUserID: journalUserID,
    journalUserName: journalUserName,
    photoURL: photoURL,
    notificationDate: notificationDate,
    seen: false,
    opened: false,
    companyID: companyID,
    companyName: companyName
  }

  // Prepare email notification
  let msgPlain = journalUserName + ' posted an article about: ' + body
  msgPlain += '';
  msgPlain += 'Best Regards,';
  msgPlain += 'Global Leadership Platform.';

  var subject = journalUserName + ' posted a new article';

  // daily thought type status - 1_approved (internal approved), 2_approved (external approved)
  var dailyThoughtType_status = article.dailyThoughtType_status;

  // start external/global approved 2_approved
  if (dailyThoughtType_status === "2_approved") {
    var all = true;

    var options = {
      "subject": subject,
      "msgTxt": msgPlain,
      "msgHTML": "",
      "photoURL": photoURL,
      "notificationMsg": journalUserName + ' posted an article about: ' + body,
      "userName": journalUserName,
      "notificationURL": 'filtered-articles?fromemail=true/#/' + notificationItemID,
      "userID": journalUserID,
      "companyID": companyID,
      "all": all,
      notificationType: 'article',
      postID: notificationItemID
    }

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
      "notificationMsg": journalUserName + ' posted an article about: ' + body,
      "userName": journalUserName,
      "notificationURL": 'filtered-articles?fromemail=true/#/' + notificationItemID,
      "userID": journalUserID,
      "companyID": companyID,
      "all": all,
      notificationType: 'article',
      postID: notificationItemID
    }

    var newNotification = userToken.createNotifications(all, options, notificationData);

    return true;
  }
  // end of 1_approved

});
