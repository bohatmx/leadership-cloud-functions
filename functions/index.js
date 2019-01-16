const functions = require('firebase-functions');
const admin = require('firebase-admin');
var curl = require('curl');
admin.initializeApp();


// Test Server
// var serviceAccount = require("./service/glp-test-firebase-adminsdk-58xlx-84586619f2.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://glp-test.firebaseio.com"
// });


// Live Server
// var serviceAccount = require("./service/leadershipplatform-158316-firebase-adminsdk-goitz-f99dd5b92d.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://leadershipplatform-158316.firebaseio.com"
// });


// for test server only - sending mails ==========
// var directTransport = require('nodemailer-direct-transport');
// var nodemailer = require('nodemailer2');
var options = {};
// var transporter = nodemailer.createTransport(directTransport(options));

// // create reusable transporter object using the default SMTP transport 
// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'cmwakio@gmail.com',
//         pass: 'ugtgaaoictdrumwn'
//     }
// });

// end test server send mails only ==========

var InfiniteLoop = require('infinite-loop');
var tokens = [];

const config = require('./modules/config.js');
var url = config.url;

const commentsIn = require('./modules/comments-in');
var handleNotifications = require('./modules/handle-notifications');
var manageUsers = require('./modules/manage-users');
var userCreated = require('./modules/user-created');
var tokenRefresh = require('./modules/token-refresh');
var newReminderIn = require('./modules/reminders-in');
var newFollowers = require('./modules/new-followers');
var updateFollowers = require('./modules/update-followers');
var testMails = require('./modules/test-mails');
var updateAnalytics = require('./modules/update-analytics');
var appAnalytics = require('./modules/app-analytics');
var commentsDeleted = require('./modules/comments-deleted');
var likesDeleted = require('./modules/likes-deleted');
var userLikes = require('./modules/user-likes');
var userClicks = require('./modules/user-clicks');
var unsubscribeUsers = require('./modules/unsubscribe-users');
var userSubscribed = require('./modules/user-subscribed');
var userUnsubscribed = require('./modules/user-unsubscribed');
var appNotifications = require('./modules/app-notifications');
var analyticsNotifications = require('./modules/analytics-notifications');
var mailNotifications = require('./modules/mail-notifications');
var userWelcomeEmail = require('./modules/welcome-email');
var followGC = require('./modules/follow-gc');
var removeUser = require('./modules/remove-user');
var unshortenURL = require('./modules/unshorten-url');
var writeOperations = require('./modules/write-operations');
var usersDeleted = require('./modules/user-deleted');

var elasticsearch = require('./modules/elasticsearch')
var userSearch = require('./modules/user-search')

// var removeBadAccounts = require('./modules/remove-badaccounts');

exports.m01 = commentsIn
exports.m02 = userCreated
exports.m03 = tokenRefresh
exports.m04 = newReminderIn
exports.m05 = newFollowers
exports.m06 = updateFollowers
exports.m07 = testMails
exports.m08 = updateAnalytics
exports.m09 = commentsDeleted
exports.m10 = likesDeleted
exports.m11 = userLikes
exports.m12 = userClicks
exports.m13 = unsubscribeUsers
exports.m14 = userSubscribed
exports.m15 = userUnsubscribed
exports.m16 = appNotifications
exports.m17 = analyticsNotifications
exports.m18 = mailNotifications
exports.m19 = followGC
exports.m20 = removeUser
exports.m21 = unshortenURL
exports.m22 = writeOperations
exports.m23 = usersDeleted
// exports.m08 = removeBadAccounts
exports.m25 = elasticsearch
exports.m26 = userSearch

var userToken = new handleNotifications();
var updateAppAnalytics = new appAnalytics();
var welcomeEmail = new userWelcomeEmail();

// on create or update daily thoughts
exports.updateAlgoliaThoughts = functions.database.ref('/dailyThoughts/{dailyThoughtID}').onCreate((snap, context) => {
  // Get Firebase object
  var dailythought = snap.val();
  console.log('created: ', dailythought);
  // Specify Algolia's objectID using the Firebase object key
  dailythought.objectID = snap.key;

  // get comapny id
  var companyID = dailythought.companyID;
  var companyName = dailythought.companyName;

  // get title and subtitle from thought object
  var body = dailythought.title;
  var subtitle = dailythought.subtitle;

  // daily thought type status - 1_approved (internal approved), 2_approved (external approved)
  var dailyThoughtType_status = dailythought.dailyThoughtType_status;
  var status = dailythought.status;
  var journalUserID = dailythought.journalUserID;
  var journalUserName = dailythought.journalUserName;
  var notificationDate = Date.now();
  var notificationItemID = snap.key;
  var photoURL = "";

  // Add count to users analytics for thoughts
  let countThoughts = admin.database().ref('users').child(journalUserID).child('analytics').child('thoughts');
  let currentCount = countThoughts.transaction(function (current) {
    return (current || 0) + 1;
  });

  if (dailythought.photoURL != undefined || dailythought.photoURL != "") {
    photoURL = dailythought.photoURL;
  } else {
    photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
  }

  if (photoURL == undefined || photoURL == "") {
    photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
  }

  // Define Thought type
  var thoughtType = "default";

  // Checks publish thought status 
  if (dailythought.publish_status === 'daily_approved')
    thoughtType = 'dailythoughts'
  else if (dailythought.publish_status === companyID.concat('_approved'))
    thoughtType = 'companythoughts'
  else if (dailythought.publish_status === 'hc_approved')
    thoughtType = 'topleaderthoughts'
  else if (dailythought.publish_status === companyID.concat('_ilead_approved'))
    thoughtType = 'ileadcorporate'
  else if (dailythought.publish_status === '-LEiZPT-C2PyLu_YLKNU_approved') // public aa
    thoughtType = 'ileadpublic'
  else
    thoughtType = 'default'

  var notificationData = {
    notificationItemID: notificationItemID,
    notificationType: 'thought',
    notificationMsg: journalUserName + ' posted a thought by ' + subtitle,
    journalUserID: journalUserID,
    journalUserName: journalUserName,
    photoURL: photoURL,
    notificationDate: notificationDate,
    seen: false,
    opened: false,
    companyID: companyID,
    companyName: companyName,
    thoughtType: thoughtType
  }

  console.log(notificationData);

  // start external/global approved 2_approved
  if ((dailyThoughtType_status === "2_approved") || (dailyThoughtType_status === "3_approved")) {
    // Prepare email notification
    let msgPlain = journalUserName + ' posted a thought by ' + subtitle
    msgPlain += '';
    msgPlain += 'Best Regards,';
    msgPlain += 'Global Leadership Platform.';

    var subject = journalUserName + ' posted a new thought';

    var all = true;

    var options = {
      "subject": subject,
      "msgTxt": msgPlain,
      "msgHTML": "",
      "photoURL": photoURL,
      "notificationMsg": journalUserName + ' posted a thought by ' + subtitle,
      "userName": journalUserName,
      "notificationURL": 'filtered-thoughts/#/' + notificationItemID,
      "userID": journalUserID,
      "companyID": companyID,
      "all": all
    }

    var newNotification = userToken.createNotifications(all, options, notificationData);

    return true;

  } // end of 2_approved
  // start internal approved (1_approved)
  if (dailyThoughtType_status === "1_approved") {
    // let tokens = [];
    // Prepare email notification
    let msgPlain = journalUserName + ' posted a thought by ' + subtitle
    msgPlain += '';
    msgPlain += 'Best Regards,';
    msgPlain += 'Global Leadership Platform.';

    var subject = journalUserName + ' posted a new thought';

    var all = false;

    if (companyID == "-LEiZPT-C2PyLu_YLKNU") {
      all = true;
    } else {
      all = false;
    }

    var options = {
      "subject": subject,
      "msgTxt": msgPlain,
      "msgHTML": "",
      "photoURL": photoURL,
      "notificationMsg": journalUserName + ' posted a thought by ' + subtitle,
      "userName": journalUserName,
      "notificationURL": 'filtered-thoughts/#/' + notificationItemID,
      "userID": journalUserID,
      "companyID": companyID,
      "all": all
    }

    var newNotification = userToken.createNotifications(all, options, notificationData);

    return true;
  }
  // end of 1_approved

  // if thoughts are pending send notification to Admin
  if (status === "pending") {

    var notificationData = {
      notificationItemID: notificationItemID,
      notificationType: 'pending-thought',
      notificationMsg: journalUserName + ' posted a new message requiring your action.',
      journalUserID: journalUserID,
      journalUserName: journalUserName,
      photoURL: photoURL,
      notificationDate: notificationDate,
      seen: false,
      opened: false,
      companyID: companyID,
      companyName: companyName
    }

    var companyID_userType = companyID + "_7";

    let companyAdmins = admin.database().ref('/users').orderByChild('companyID_userType').equalTo(companyID_userType).once('value')

    const got_admins = companyAdmins.then(snap => {
      snap.forEach(userv => {
        var admin_user = userv.val();
        var admin_key = userv.key;

        let device_tokens = admin.database().ref('user').orderByChild('userID')
          .equalTo(admin_key).once('value')

        device_tokens.then(snap => {
          snap.forEach(function (childSnapshot) {

            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var url = userToken.getCompanyURL(companyID)

            var payload = {
              title: 'New Pending Thought',
              body: journalUserName + ' posted a new message requiring your action.',
              icon: "/images/manifest/icon-48x48.png",
              sound: 'default',
              badge: 1,
              click_action: url + "thoughts-management"
            };

            var notification_key = childData.notification_key;

            if (notification_key == undefined) {
              console.log("undefined key for user: ", admin_key)
            } else {
              var msg = {
                "notification_key": notification_key,
                payload: payload
              }
              userToken.send(msg);
            }

          });

        }).catch(err => {
          console.log('Tokens Error: ', err);
        })

        var newNotificationID = admin.database().ref().child('users/' + admin_key + '/notifications').push().key;

        notificationData.newNotificationID = newNotificationID;
        // Write the new notification's data
        var updates = {};
        updates['users/' + admin_key + '/notifications/' + newNotificationID] = notificationData;

        admin.database().ref().update(updates).then(postsupdate => {
          console.log('pending thoughts notification to admin');
        }).catch(posts_err => {
          console.log('pending posts error to admin');
        })

      });

      return true;
    }).catch(err => {
      console.log('Pending admins Error: ', err);
    }) //end got_admins

  }


});

// on delete daily thoughts
exports.deletedThoughts = functions.database.ref('/dailyThoughts/{dailyThoughtID}').onDelete((snap, context) => {
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
      notificationType: 'thought',
      journalUserID: journalUserID,
      companyID: companyID
    }

    // Add count to users analytics for thoughts
    let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('thoughts');

    let countItem = countItems.transaction(function (current) {
      if (current == 0) {
        return current
      } else {
        return (current || 0) - 1;
      }

    });

    updateAppAnalytics.removeposts(notificationData);
  }

});

function loadUsers(userID) {
  let dbRef = admin.database().ref('/users');
  let dbFollowers = admin.database().ref('/users/' + userID + '/follower');
  let defer = new Promise((resolve, reject) => {
    dbFollowers.once('value', (snap) => {
      let data = snap.val();
      let users = [];

      snap.forEach(datav => {
        // get the key and data from the snapshot
        // const childKey = datav.key;
        // const childData = datav.val();
        users.push(datav);
      });

      resolve(users);
    }, (err) => {
      reject(err);
    });
  });
  return defer;
}

exports.unshortenUserURLs = functions.https.onRequest((req, res) => {
  var TinyURL = require('tinyurl');
  var userURL = url + "#/lead/user/sign-up";

  TinyURL.shorten(userURL, function (res) {
    console.log(res); //Returns a shorter version of http://google.com - http://tinyurl.com/2tx
  });

})

exports.manageAllUsers = functions.https.onRequest((req, res) => {
  var manageAllUsers = new manageUsers();
  manageAllUsers.updateAllUsers();
});

exports.manageUserTokens = functions.https.onRequest((req, res) => {
  var users = admin.database().ref('/users').once('value');

  users.then(snapshot => {
    snapshot.forEach(function (childSnapshot) {

      var childData = childSnapshot.val();
      var childKey = childSnapshot.key;

      var deviceTokens = childData.deviceTokens;
      var tokens = [];
      var uid = childData.uid;
      var device = {};

      if ((deviceTokens != undefined) || (deviceTokens != null) && (childData.notification_key == undefined)) {
        device.uid = uid;
        console.log("uid: ", uid);

        userToken.getNotificationKey(uid);
      }

    });

  });
});

exports.createUserTokens = functions.https.onRequest((req, res) => {
  var users = admin.database().ref('/users').once('value');

  users.then(snapshot => {
    snapshot.forEach(function (childSnapshot) {

      var childData = childSnapshot.val();
      var childKey = childSnapshot.key;

      var deviceTokens = childData.deviceTokens;
      var tokens = [];
      var uid = childData.uid;
      var device = {};

      if ((deviceTokens != undefined) || (deviceTokens != null) && (childData.notification_key == undefined)) {
        device.uid = uid;
        console.log("uid: ", uid);

        for (var key in deviceTokens) {
          tokens.push(deviceTokens[key]);
        }

        device.reg_ids = tokens;
        // userToken.getNotificationKey(uid);
        userToken.create(device);
      }

    });

  });
});

exports.sendUserReminders = functions.https.onRequest((req, res) => {
  sendPLDPReminders();

  // res.send(status);
})

// on create or update articles
exports.updateAlgoliaArticles = functions.database.ref('/news/{newsID}').onCreate((snap, context) => {
  // Get Firebase object
  var article = snap.val();
  // Specify Algolia's objectID using the Firebase object key
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
      "notificationURL": 'filtered-articles/#/' + notificationItemID,
      "userID": journalUserID,
      "companyID": companyID,
      "all": all
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
      "notificationURL": 'filtered-articles/#/' + notificationItemID,
      "userID": journalUserID,
      "companyID": companyID,
      "all": all
    }

    var newNotification = userToken.createNotifications(all, options, notificationData);

    return true;
  }
  // end of 1_approved

});

// on delete articles
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
      if (current == 0) {
        return current
      } else {
        return (current || 0) - 1;
      }
    });

    updateAppAnalytics.removeposts(notificationData);

  }
});

// on create or update podcasts
exports.newPodcast = functions.database.ref('/podcasts/{podcastID}').onCreate((snap, context) => {
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
        "notificationURL": 'filtered-podcasts/#/' + notificationItemID,
        "userID": journalUserID,
        "companyID": companyID,
        "all": all
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
        "notificationURL": 'filtered-podcasts/#/' + notificationItemID,
        "userID": journalUserID,
        "companyID": companyID,
        "all": all
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

// on delete podcasts
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
      if (current == 0) {
        return current
      } else {
        return (current || 0) - 1;
      }

    });
  }


});

// on create or update videos
exports.newVideo = functions.database.ref('/videos/{videoID}').onCreate((snap, context) => {
  // Get Firebase object
  var video = snap.val();
  // Specify Algolia's objectID using the Firebase object key
  video.objectID = snap.key;
  var UploadExternal = video.UploadExternal;

  // get title and subtitle from thought object
  var company_status = video.company_status;

  console.log("company_status: ", company_status)

  // daily thought type status - 1_approved (internal approved), 2_approved (external approved)
  var dailyThoughtType_status = video.dailyThoughtType_status;

  console.log("dailyThoughtType_status: " + dailyThoughtType_status)
  console.log("UploadExternal: " + UploadExternal)

  if ((company_status == "general_true") || (company_status == "general_false")) {
    var title = video.title;

    var journalUserID = video.userID;
    var journalUserName = video.userName;
    var notificationDate = Date.now();
    var notificationItemID = snap.key;
    var photoURL = "";
    var companyID = video.companyID;
    var companyName = video.companyName;

    var updateOwner = {};
    updateOwner['videos/' + snap.key + '/postOwner'] = journalUserID;
    admin.database().ref().update(updateOwner).then(postsupdate => {
      console.log('updateOwner videos');
    }).catch(posts_err => {
      console.log('updateOwner videos error');
    })

    if (video.photoURL != undefined || video.photoURL != "") {
      photoURL = video.photoURL;
    } else {
      photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    if (photoURL == undefined) {
      photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    var notificationData = {
      notificationItemID: notificationItemID,
      notificationType: 'video',
      notificationMsg: journalUserName + ' posted a video about: "' + title + '"',
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
    let msgPlain = journalUserName + ' posted a video about ' + title
    msgPlain += '';
    msgPlain += 'Best Regards,';
    msgPlain += 'Global Leadership Platform.';

    var subject = journalUserName + ' shared a new video';

    // start external/global approved 2_approved
    if (dailyThoughtType_status === "2_approved") {
      var all = true;

      var options = {
        "subject": subject,
        "msgTxt": msgPlain,
        "msgHTML": "",
        "photoURL": photoURL,
        "notificationMsg": journalUserName + ' posted a video about ' + title,
        "userName": journalUserName,
        "notificationURL": 'filtered-videos/#/' + notificationItemID,
        "userID": journalUserID,
        "companyID": companyID,
        "all": all
      }

      // Add count to users analytics for thoughts
      let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('videos');
      let currentCount = countItems.transaction(function (current) {
        return (current || 0) + 1;
      });

      var newNotification = userToken.createNotifications(all, options, notificationData);
      // return true;

    } // end of 2_approved
    // start internal approved (1_approved)
    if (dailyThoughtType_status === "1_approved") {
      var all = false;

      var options = {
        "subject": subject,
        "msgTxt": msgPlain,
        "msgHTML": "",
        "photoURL": photoURL,
        "notificationMsg": journalUserName + ' posted a video about ' + title,
        "userName": journalUserName,
        "notificationURL": 'filtered-videos/#/' + notificationItemID,
        "userID": journalUserID,
        "companyID": companyID,
        "all": all
      }

      // Add count to users analytics for thoughts
      let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('videos');
      let currentCount = countItems.transaction(function (current) {
        return (current || 0) + 1;
      });

      var newNotification = userToken.createNotifications(all, options, notificationData);

      // return true;
    }
    // end of 1_approved

    if (UploadExternal === "external") {
      var url = video.url;

      // Update TED urls with embed code
      if (url.includes('.ted.com')) {

        curl.get(url, {}, function (err, response, body) {
          // console.log("response: ",response.headers);
          // res.json("https://embed.ted.com"+response.request.uri.pathname);
          var updatedurl = "https://embed.ted.com" + response.request.uri.pathname;

          var updateURL = {};
          updateURL['videos/' + snap.key + '/url'] = updatedurl;

          admin.database().ref().update(updateURL).then(postsupdate => {
            console.log('update url');
          }).catch(posts_err => {
            console.log('update url videos error', posts_err);
          })
        });
      }

    }
  }



});

// on delete videos
exports.deletedVideos = functions.database.ref('/videos/{videoID}').onDelete((snap, context) => {
  // Get Firebase object
  const deletedItem = snap.val();
  console.log('deleted: ', deletedItem);
  var journalUserID = deletedItem.userID;
  var notificationItemID = deletedItem.key;
  var companyID = deletedItem.companyID;
  var status = deletedItem.status;

  if (status == "approved") {
    var notificationData = {
      notificationItemID: notificationItemID,
      notificationType: 'video',
      journalUserID: journalUserID,
      companyID: companyID
    }

    // Add count to users analytics for thoughts
    let countItems = admin.database().ref('users').child(journalUserID).child('analytics').child('videos');
    let countItem = countItems.transaction(function (current) {
      if (current == 0) {
        return current
      } else {
        return (current || 0) - 1;
      }
    });
  }


});

// exports.userDisabled = functions.database.ref('/users/{userID}').onUpdate(event => {
//   const currdata = event.data.val();
//   const prevdata = event.data.previous.val();
//   const uid = currdata.uid;
  
//   const key = event.data.key;

//   if (prevdata.disabled !== currdata.disabled) {
//       //status has changed
//       // statusHasChanged = true;
//       var disabled = currdata.disabled;
      
//       admin.auth().updateUser(uid, {
//         disabled: disabled
//       })
//       .then(function(userRecord) {
//         // See the UserRecord reference doc for the contents of userRecord.
//         console.log("Successfully disabled user", userRecord.toJSON());
//       })
//       .catch(function(error) {
//         console.log("Error updating user:", error);
//       });
//   }

// });


exports.sendEmailFeedback = functions.database.ref('/feedback/{feedbackID}').onCreate((snap, context) => {
  // Get Firebase object
  const feedbackobj = snap.val();
  const feedbackobjid = snap.key;

  var message = feedbackobj.message;
  var subject = feedbackobj.subject;
  var category = feedbackobj.category;
  var senderName = feedbackobj.journalUserName;
  var senderEmail = feedbackobj.journalUserEmail;
  var userPlatform = feedbackobj.userPlatform;
  var companyID = feedbackobj.companyID;

  if (category == undefined) {
    category = "Feedback";
  }

  if (userPlatform == undefined) {
    userPlatform = " N/A ";
  }

  if (message !== undefined && message.length > 2) {

    let msg = '<b>Dear Leadership Platform,</b><br><br>';
    msg += 'Category: ' + category + '<br><br>';
    msg += 'Subject: ' + subject + '<br><br>';
    msg += 'Message: ' + message + '<br><br>';
    msg += 'From: ' + senderName + ' <br>';
    msg += 'Email: ' + senderEmail + '<br>';
    msg += '<br>';
    msg += '<b>Best Regards,</b> <br>';
    msg += '<b>Global Leadership Platform.</b><br>';
    msg += '<br><br>';
    msg += '<i>User Platform: ' + userPlatform + '</i><br>';

    let msgPlain = 'Dear Leadership Platform,';
    msgPlain += 'Category: ' + category + '<br><br>';
    msgPlain += 'Subject: ' + subject + '';
    msgPlain += 'Message: ' + message + '';
    msgPlain += 'From: ' + senderName + '';
    msgPlain += 'Email: ' + senderEmail + '';
    msgPlain += '';
    msgPlain += 'Best Regards,';
    msgPlain += 'Global Leadership Platform.';
    msgPlain += '';
    msgPlain += '';
    msgPlain += 'User Platform: ' + userPlatform + '<br>';

    var subject = '[' + category + ' - Global Leadership Platform] : ' + subject;

    if (companyID == "-LOs4iZh3Y9LSiNtpWlH") {
      // Send to Khanyisa
      var to = 'support@thinklead.co.za, KMhlaba@edcon.co.za';
    } else {
      // Send to LDP
      var to = 'support@thinklead.co.za, info@leadershipplatform.com';
    }


    // live server options
    let emailRes = sendEmails(to, subject, msgPlain, msg);
  }

  return true;
});

exports.updateNewUsers = functions.database.ref('/newUploadUsers/{newUploadUserID}').onCreate((snap, context) => {
  // Get Firebase object
  const userobj = snap.val();
  const userobjid = snap.key;

  if ((userobj != undefined) || (userobj != null)) {
    if (userobj.email != undefined) {
      var email = userobj.email;
    }
  }

  if (email !== undefined && email.length > 5) {
    var userID = admin.database().ref().child('users').push().key;
    var password = userobj.password;
    var displayName = userobj.firstName + " " + userobj.lastName;
    var lastName = userobj.lastName;
    var firstName = userobj.firstName;
    let companyID = userobj.companyID;
    let companyName = userobj.companyName;
    // get date and time
    var dateRegistered = userobj.dateRegistered;
    var stringDateRegistered = userobj.stringDateRegistered;
    let userType = userobj.userType;
    let userDescription = userobj.userDescription;

    var url = userToken.getCompanyURL(companyID);

    var msgPlain = "",
      msg = "";

    // construct emails - plain and html templates
    msgPlain = welcomeEmail.plainEmail(userobj, url);
    msg = welcomeEmail.htmlEmail(userobj, url);

    return admin.auth().createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: displayName,
      disabled: false
    }).then(function (user) {
      var uid = user.uid;

      var data = {
        "companyID": companyID,
        "companyName": companyName,
        "dateRegistered": dateRegistered,
        "email": email,
        "firstName": firstName,
        "lastName": lastName,
        "password": password,
        "stringDateRegistered": stringDateRegistered,
        "userDescription": userDescription,
        "uid": uid,
        "userID": userID,
        "userType": userType,
        "inviteSent": true,
        "companyID_userType": companyID + "_" + userType
      }

      // Write the new user data
      var updates = {};
      updates['users/' + userID] = data;
      admin.database().ref().update(updates);

      admin.database().ref('/user/' + uid).set(data);

      // Live server only
      if(config.environment === 1){
        // create a followGC record
        admin.database().ref('/followGC/' + uid).set(data);

        var to = email;
        var subject = 'Welcome to Global Leadership Platform';

        // Send Email Notification
        let emailRes = sendEmails(to, subject, msgPlain, msg)
      }
      
      // delete user
      admin.database().ref('newUploadUsers/' + userobjid).remove();

      return user;
    }, function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });

  }
});

// on create or update podcasts
exports.newUserCreated = functions.database.ref('/user/{userID}').onCreate((snap, context) => {
  // Get Firebase object
  const user = snap.val();

  if (user) {
    // Specify Algolia's objectID using the Firebase object key
    var companyID = user.companyID;

    if (companyID != undefined) {
      // Add count to users analytics for users
      let countItems = admin.database().ref('company-analytics').child(companyID).child('counts').child('noofusers');
      let currentCount = countItems.transaction(function (current) {
        return (current || 0) + 1;
      });

      // assign user data
      var userData = user;

      // create new key
      // var writeOperationsID = admin.database().ref().child('writeOperations/newUserElastic').push().key;
      // userData.writeOperationsID = writeOperationsID;

      // // update writeOperations data
      // var updates = {};
      // updates['writeOperations/newUserElastic/'+writeOperationsID+'/userData'] = userData;

      // admin.database().ref().update(updates).then(postsupdate => {
      //     console.log('New user Elastic search record posted');
      // }).catch(posts_err => {
      //     console.log('Error posting new user Elastic search record posted');
      // })

    }
  }
});

// on delete daily thoughts
exports.userDeleted = functions.database.ref('/user/{userID}').onDelete((snap, context) => {
  // Get Firebase object
  const deletedItem = snap.val();
  var companyID = deletedItem.companyID;

  // Add count to users analytics for users
  let countItems = admin.database().ref('company-analytics').child(companyID).child('counts').child('noofusers');

  let countItem = countItems.transaction(function (current) {
    if (current == 0) {
      return current
    } else {
      return (current || 0) - 1;
    }
  });
  
});

/**
 *  Return a new user and indexes it on elastic search
 */

exports.createNewUserData = functions.https.onRequest((req, res) => {
  const userRef = admin.database().ref('/users');

  //Create user from req body 
  const {
    firstName,
    lastName,
    email
  } = req.body
  const userData = {
    firstName,
    lastName,
    email
  }

  // Expect a promise 
  const p = userRef.push(userData)

  return p.then(snapshot => {
    res.send(snapshot)
  })

})


// exports.getAllCarsData = functions.https.onRequest((req, res) => {
//   let carsRef = admin.database().ref('/cars');
//   let carsImportLimit = 1000;
//   let pushPromises = [];
//   console.log('Importing ' + carsImportLimit + 'cars');
//   for (let i = 0; i < carsImportLimit; i++) {
//     pushPromises.push(carsRef.push(cars[i]));
//   }


//   // Terminate by returning 
//   return Promise.all(pushPromises).then((snapshot) => res.send("Added all car data!")).catch((err) => console.log("Error : %s", err.message));


// })
// Testing search elastic

// exports.deleteAllCarData = functions.https.onRequest((req, res) => {
//   var carsRef = admin.database().ref('/cars');
//   let carsImportLimit = 1000;
//   let pushPromises = [];


//   console.log('Importing ' + carsImportLimit + 'cars');
//   for (let i = 0; i < carsImportLimit; i++) {
//     pushPromises.push(carsRef.push(cars[i]));
//   }


//   // Terminate by returning 
//   return Promise.all(pushPromises)
//     .then((snapshot) => res.send("Added all car data!"))
//     .catch((err) => console.log("Error : %s", err.message));



// })
// MyPLDP Notification Reminder
function sendEmails(to, subject, msgTxt, msgHTML) {
  var options = {
    "to": to,
    "bcc": 'colman@oneconnect.co.za',
    "subject": subject,
    "msgTxt": msgTxt,
    "msgHTML": msgHTML
  }

  return userToken.sendNewUserEmail(options);
};

exports.publishContent = functions.https.onRequest((req, res) => {
  var tl = new InfiniteLoop;
  tl.stop();
  tl.add(myLoops);
  tl.setInterval(55000);
  tl.run();
  tl.onError(function (error) {
    console.log('Test Loops', error);
  });

  // res.send(true);
});

function myLoops() {
  publishScheduledContent();
}

function sendPLDPReminders() {
  const reminders_res = getDueUnsentPLDPReminders();

  reminders_res.then(snap => {
    for (let rems of snap) {

      let userName = rems.journalUserName
      let msg = rems.moveAction + ': ' + rems.title
      let notificationDate = Date.now()
      var notificationFequency = rems.reminderFrequency;
      var myPLDPID = rems.myPLDPID;
      var moveAction = rems.moveAction;
      moveAction = moveAction.toLowerCase();
      var notificationID = rems.notificationID;
      var reminderDate = rems.reminderDate;
      var stringReminderDate = rems.stringReminderDate;
      var reminderStatus = rems.reminderStatus;
      var journalUserID = rems.journalUserID;
      var title = rems.title;
      var photoURL = rems.photoURL;
      var companyID = rems.companyID;
      var companyName = rems.companyName;

      console.log("rems photo: ", rems.photoURL);

      if (photoURL == undefined) photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";

      console.log("photoURL: ", photoURL);



      var notificationData = {
        notificationItemID: notificationID,
        notificationType: 'pldpreminder',
        notificationMsg: 'You have a PLDP reminder about: "' + title + '"',
        journalUserID: journalUserID,
        journalUserName: userName,
        photoURL: photoURL,
        notificationDate: notificationDate,
        seen: false,
        opened: false,
        companyID: companyID,
        companyName: companyName
      }

      var companyURL = userToken.getCompanyURL(companyID);

      console.log("user: ", journalUserID);
      let payload = {
        title: 'Leadership Platform - MyPLD Notification',
        body: msg,
        icon: "/images/manifest/icon-48x48.png",
        sound: 'default',
        badge: '1',
        click_action: companyURL + "my-pldp"
      }

      let device_tokens = admin.database().ref('user').orderByChild('userID').equalTo(journalUserID).once('value');

      device_tokens.then(snap => {
        console.log("fetch device tokens");

        snap.forEach(function (childSnapshot) {

          console.log("gotten device tokens");

          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();

          console.log(childData);

          var notification_key = childData.notification_key;
          var email = childData.email;
          var receivePLDPEmails = childData.receivePLDPEmails;
          var uid = childKey;

          if (receivePLDPEmails == undefined) {
            receivePLDPEmails = true;
          }

          if (notification_key == undefined) {
            console.log("undefined key for user: ", journalUserID)
          } else {
            var msg = {
              "notification_key": notification_key,
              payload: payload
            }
            console.log("send fcm: ", msg);
            userToken.send(msg);
          }

          // Send email notification
          if (email == undefined) {
            console.log("undefined email for user: ", rems.journalUserID)
          } else {
            // If user subscribed to PLDP emails
            if (receivePLDPEmails == true) {
              // create email body
              let msgHTML = '<b>Dear ' + rems.journalUserName + ',</b><br><br>';
              msgHTML += 'You have a new PLDP reminder about: ' + rems.title + '<br><br>';
              msgHTML += '<br>';
              msgHTML += '<b>Best Regards,</b> <br>';
              msgHTML += '<b>Global Leadership Platform.</b><br>';

              let msgPlain = 'Dear ' + rems.journalUserName + ',';
              msgPlain += 'You have a new PLDP reminder about: ' + rems.title;
              msgPlain += '';
              msgPlain += 'Best Regards,';
              msgPlain += 'Global Leadership Platform.';

              var subject = 'PLDP Reminder - Global Leadership Platform';

              var options = {
                "to": email,
                "subject": subject,
                "msgTxt": msgPlain,
                "msgHTML": msgHTML,
                "photoURL": photoURL,
                "notificationMsg": 'You have a new PLDP reminder about: ' + rems.title,
                "userName": userName,
                "notificationURL": "my-pldp",
                "companyURL": companyURL
              }
              console.log("send email notify: ", options);

              var link = 'email=' + email + '&type=pldp&action=' + uid + '&notification=' + journalUserID;

              userToken.sendNodeEmail(options, link);

            }

          }
        });

      }).catch(err => {
        console.log('Tokens Error: ', err);
      });

      var newNotificationID = admin.database().ref().child('users/' + rems.journalUserID + '/pldpnotifications').push().key;
      notificationData.newNotificationID = newNotificationID;

      // Write the new notification's data
      var updates = {};
      updates['users/' + rems.journalUserID + '/pldpnotifications/' + newNotificationID] = notificationData;
      admin.database().ref().update(updates).then(notify_res => {
        console.log('Write the new notifications data');
      }).catch(notify_err => {
        console.log('notify_err');
      });

      // Set reminder Status
      reminderStatus = "Sent";

      // reset notification per settings
      if (notificationFequency !== "Does not repeat") {
        var d = new Date(reminderDate);
        // set new dates according to frequency
        if (notificationFequency === "Hourly") d.setHours(d.getHours() + 1);
        if (notificationFequency === "Daily") d.setDate(d.getDate() + 1);
        if (notificationFequency === "Weekly") d.setDate(d.getDate() + 7);
        if (notificationFequency === "Monthly") d.setMonth(d.getMonth() + 1);
        if (notificationFequency === "Yearly") d.setFullYear(d.getFullYear() + 1);

        reminderDate = Date.parse(d);
        stringReminderDate = formatDate(reminderDate);
        reminderStatus = "Unsent";
      }
      //End reset notification per settings

      // Update the notification reminder
      var notificationUpdates = {};
      notificationUpdates['pldpNotifications/' + notificationID + '/reminderDate'] = reminderDate;
      notificationUpdates['pldpNotifications/' + notificationID + '/stringReminderDate'] = stringReminderDate;
      notificationUpdates['pldpNotifications/' + notificationID + '/reminderStatus'] = reminderStatus;

      admin.database().ref().update(notificationUpdates).then(notificationupdates_res => {
        console.log('update pldp notification reminder 1');
      }).catch(notificationupdates_err => {
        console.log('notificationupdates_err');
      });

      // Update the pldp's notification reminder
      var pldpUpdates = {};
      pldpUpdates['myPLDP/' + moveAction + '/' + myPLDPID + '/reminderDate'] = reminderDate;
      pldpUpdates['myPLDP/' + moveAction + '/' + myPLDPID + '/stringReminderDate'] = stringReminderDate;
      pldpUpdates['myPLDP/' + moveAction + '/' + myPLDPID + '/reminderStatus'] = reminderStatus;

      admin.database().ref().update(pldpUpdates).then(pldpupdates_res => {
        console.log('update pldp notification reminder 2');
      }).catch(pldpupdates_err => {
        console.log('pldpUpdates_err');
      });

    }
    // console.log('snap out',snap);
  }).catch(error => {
    console.log("reminders_res error", error);
    return false;
  })

  console.log('Running PLDP Reminders')

  return true;
}

function getDueUnsentPLDPReminders() {
  var status = "Unsent";
  var d = Date.now();
  var e = new Date(d);
  e.setSeconds(0, 0);
  var newDate = Date.parse(e);

  var fiveMinutesAgo = newDate - 300000;
  var reminders = [];

  let dbRef = admin.database().ref('/pldpNotifications').orderByChild('reminderStatus').equalTo(status).once('value')

  const reminders_prom = dbRef.then(snap => {
    snap.forEach(datav => {
      var send_reminder = datav.val();
      var reminderdate = send_reminder.reminderDate;
      var journalUserID = send_reminder.journalUserID;
      var journalUserName = send_reminder.journalUserName;

      // console.log("PLDP for : ",journalUserName);
      if ((reminderdate >= fiveMinutesAgo) && (reminderdate <= newDate)) {
        console.log(journalUserName + " push to reminders");
        // console.log("reminderdate: ", reminderdate);
        // console.log("newDate: ", newDate);
        // console.log("fiveMinutesAgo: ", fiveMinutesAgo);
        reminders.push(send_reminder);
      } else {
        console.log("nothing to push to reminders");
      }

    });

    return reminders;
  })

  return reminders_prom;
}

// Publish new Thoughts, new Articles, new Videos, new Podcasts, new Voicemails
function publishScheduledContent() {

  var d = Date.now();
  var e = new Date(d);
  e.setSeconds(0, 0);
  var newDate = Date.parse(e);
  var checkStatus = 'unpublished';

  // Get a reference to the database service

  // publish new Thoughts
  const refThoughts = admin.database().ref('/dailyThoughts');
  refThoughts.orderByChild('status')
    .equalTo(checkStatus)
    .once('value')
    .then(function (snapshot) {
      // console.log("snapshot: ", snapshot)

      snapshot.forEach(function (childSnapshot) {
        // console.log("child snapshot: ", childSnapshot)

        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        var dateScheduled = childData.dateScheduled;
        console.log("dateScheduled: ", dateScheduled)
        console.log("newDate: ", newDate)

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/dailyThoughts').push().key;
          var newItemID = childData.dailyThoughtID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = 'approved';
          var topLeader_status = childData.topLeader_status;
          var publish_status = childData.publish_status;
          var companyID_status = companyID + '_' + status;

          // set publish status
          if (publish_status === "hc_unpublished") publish_status = "hc_" + status;
          else if (publish_status === "daily_unpublished") publish_status = "daily_" + status;
          else if (publish_status === "-LEiZPT-C2PyLu_YLKNU_unpublished") publish_status = "-LEiZPT-C2PyLu_YLKNU_" + status;
          else if (publish_status === companyID + "_ilead_unpublished") {
            publish_status = companyID + "_ilead_" + status;
            companyID_status = "corporate_ilead_" + status;
          } else publish_status = companyID + "_" + status;

          // set the new dailythought ID
          childData.dailyThoughtID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + '_' + status;
          childData.status = status;
          childData.companyID_status = companyID_status;
          childData.topLeader_status = topLeader_status + '_' + status;
          childData.publish_status = publish_status;

          // Write the new notification's data
          var updates = {};
          updates['/dailyThoughts/' + newItemID] = childData;

          admin.database().ref('dailyThoughts/' + childKey).set(null).then(() => {
            admin.database().ref().update(updates).then(update_res => {
              console.log('Success updating daily thoughts published id: ' + newItemID + ' old id: ' + childKey);
            }).catch(error => {
              console.log('Error updating daily thoughts published id ' + newItemID);
            })
          });

          console.log('published thought ' + newItemID);
        }
      });
    }).catch(error => {
      console.log('Error releasing thoughts', error)
    });

  // publish new Articles
  const refArticles = admin.database().ref('/news');
  refArticles.orderByChild('status')
    .equalTo(checkStatus)
    .once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var dateScheduled = childData.dateScheduled;


        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/news').push().key;
          var newItemID = childData.newsID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = 'approved';
          var topLeader_status = childData.topLeader_status;

          childData.newsID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + '_' + status;
          childData.status = status;
          childData.companyID_status = companyID + '_' + status;
          childData.topLeader_status = topLeader_status + '_' + status;

          // Write the new notification's data
          var updates = {};
          updates['/news/' + newItemID] = childData;

          admin.database().ref('news/' + childKey).set(null).then(() => {
            admin.database().ref().update(updates).then(update_res => {
              console.log('Success updating articles published id: ' + newItemID + ' old id ' + childKey);
            }).catch(error => {
              console.log('Error updating articles published id ' + childKey);
            })
          });

          console.log('published articles ' + newItemID);
        }
      });
    }).catch(error => {
      console.log('Error releasing articles', error)
    });

  // publish new Podcasts
  const refPodcasts = admin.database().ref('/podcasts');
  refPodcasts.orderByChild('status')
    .equalTo(checkStatus)
    .once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var dateScheduled = childData.dateScheduled;

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/podcasts').push().key;
          var newItemID = childData.podcastID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = 'approved';
          var topLeader_status = childData.topLeader_status;

          childData.podcastID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + '_' + status;
          childData.status = status;
          childData.companyID_status = companyID + '_' + status;
          childData.topLeader_status = topLeader_status + '_' + status;
          childData.company_status = "general_true";

          // Write the new notification's data
          var updates = {};
          updates['/podcasts/' + newItemID] = childData;

          // console.log(updates);
          admin.database().ref('podcasts/' + childKey).set(null).then(() => {
            admin.database().ref().update(updates).then(update_res => {

              console.log('Success updating voicemails published id' + newItemID + ' old id: ' + childKey);
            }).catch(error => {
              console.log('Error updating voicemails published id ' + childKey);
            })
          });

          console.log('published podcast/voicemail ' + newItemID);
        }
      });
    }).catch(error => {
      console.log('Error releasing podcasts', error)
    });


  // publish new Videos
  const refVideos = admin.database().ref('/videos');
  refVideos.orderByChild('status')
    .equalTo(checkStatus)
    .once('value')
    .then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var dateScheduled = childData.dateScheduled;

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/videos').push().key;
          var newItemID = childData.videoID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = 'approved';
          var topLeader_status = childData.topLeader_status;

          childData.videoID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + '_' + status;
          childData.status = status;
          childData.companyID_status = companyID + '_' + status;
          childData.topLeader_status = topLeader_status + '_' + status;
          childData.company_status = "general_true";

          // Write the new notification's data
          var updates = {};
          updates['/videos/' + newItemID] = childData;

          // console.log(updates);
          admin.database().ref('videos/' + childKey).set(null).then(() => {
            admin.database().ref().update(updates).then(update_res => {
              console.log('Success updating videos published id' + newItemID + ' old id: ' + childKey);
            }).catch(error => {
              console.log('Error updating videos published id ' + childKey);
            })
          });


          console.log('published videos ' + childKey);
        }
      });
    }).catch(error => {
      console.log('Error releasing videos', error)
    });

  console.log('running publishing content')
  // end publish new content
};

//custom date functions
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    hours = '' + d.getHours(),
    minutes = '' + d.getMinutes(),
    seconds = '' + d.getSeconds(),
    milliseconds = '' + d.getMilliseconds();

  var today = new Date(),
    thisYear = today.getFullYear();

  // get month name
  var monthName = getDayMonthStr(d.getMonth(), "month", false);

  // add preceding zeros where needed
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hours.length < 2) hours = '0' + hours;
  if (minutes.length < 2) minutes = '0' + minutes;
  if (seconds.length < 2) seconds = '0' + seconds;
  if (milliseconds.length < 2) milliseconds = '0' + milliseconds;

  // format reminder date
  if (thisYear === year) {
    var reminderDate = monthName + " " + day + ", " + hours + ":" + minutes;
  } else {
    var reminderDate = monthName + " " + day + ", " + year + ", " + hours + ":" + minutes;
  }

  return reminderDate;
}

function getDayMonthStr(val, dateParam, long) {
  // days
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var daysShort = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  // Months
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (dateParam === "day" && long === true) {
    // return day in long format
    return days[val];
  } else if (dateParam === "day" && long === false) {
    // return days in short
    return daysShort[val];
  }
  if (dateParam === "month" && long === true) {
    // return month in long format
    return monthNames[val];
  } else if (dateParam === "month" && long === false) {
    // return month in short
    return monthNamesShort[val];
  }

}

// end custom date functions