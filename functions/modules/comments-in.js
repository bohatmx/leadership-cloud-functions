const functions = require("firebase-functions");
const admin = require("firebase-admin");
var handleNotifications = require("../modules/handle-notifications");
var appAnalytics = require("./app-analytics");

var userToken = new handleNotifications();
var updateAppAnalytics = new appAnalytics();

var tokens = [];
const config = require("./config.js");
var url = config.url[config.environment];

// on create or update daily thoughts
exports.newCommentsIn = functions.database
  .ref("/comments/{commentID}")
  .onCreate((snap, context) => {
    const commentObj = snap.val();

    var postID = commentObj.dailyThoughtID;
    var childRef = config.postKeyFields[commentObj.postType];
    var userID = commentObj.journalUserID;
    var userName = commentObj.journalUserName;
    var photoURL = commentObj.photoURL;
    var notificationItemID = commentObj.dailyThoughtID;

    // if (commentObj.postType == "dailyThoughts") childRef = "dailyThoughtID";
    // else if (commentObj.postType == "news") childRef = "newsID";
    // else if (commentObj.postType == "videos") childRef = "videoID";
    // else if (commentObj.postType == "podcasts") childRef = "podcastID";

    updateAppAnalytics.addcomments(commentObj);

    const postRef = admin
      .database()
      .ref("/" + config.postTypes[commentObj.postType])
      .orderByChild("" + childRef)
      .equalTo("" + postID)
      .once("value");
    postRef
      .then(snapA => {
        snapA.forEach(function(childSnapshot) {
          var postObj = childSnapshot.val();
          var postObjID = childSnapshot.key;
          var journalUserID,
            journalUserName = "";
          var notificationTitle,
            notificationType,
            click_action = "";
          var notificationDate = Date.now();

          if (
            commentObj.postType == "videos" ||
            commentObj.postType == "podcasts"
          ) {
            journalUserID = postObj.userID;
            journalUserName = postObj.userName;

            if (commentObj.postType == "videos") {
              notificationType = "video";
              click_action = "filtered-videos/#/" + postID;
            } else if ((commentObj.postType = "podcasts")) {
              notificationType = postObj.podcastDescription.toLowerCase();
              click_action = "filtered-podcasts/#/" + postID;
            }

            notificationTitle = postObj.title;
          } else {
            journalUserID = postObj.journalUserID;
            journalUserName = postObj.journalUserName;

            if (commentObj.postType == "thoughts") {
              notificationType = "thought";
              notificationTitle = postObj.subtitle;
              click_action = "filtered-thoughts/#/" + postID;
            } else if ((commentObj.postType == "articles")) {
              notificationType = "article";
              notificationTitle = postObj.title;
              click_action = "filtered-articles/#/" + postID;
            }
          }

          if (postObj.groupid != undefined  && postObj.groupid.trim() != "") {
            click_action = "filtered-group-posts/#/" + postObj.groupid + "/" + postID
          }

          // If the ID of the person commenting is not equal to the person who posted
          if (journalUserID != userID) {
            var notificationData = {
              notificationItemID: notificationItemID,
              notificationType: notificationType,
              notificationMsg:
                userName +
                " commented on your " +
                notificationType +
                " about: " +
                notificationTitle,
              journalUserID: userID,
              journalUserName: userName,
              photoURL: photoURL,
              notificationDate: notificationDate,
              seen: false,
              opened: false,
              companyID: postObj.companyID,
              companyName: postObj.companyName
            };

            if (postObj.groupid != undefined && postObj.groupid.trim() != "") {
              notificationData.postGroupType = postObj.postGroupType
              notificationData.groupid = postObj.groupid
            }

            var payload = {
              title: userName + " commented on your " + notificationType,
              body: userName + " commented on " + notificationTitle,
              icon: "/images/manifest/icon-48x48.png",
              sound: "default",
              badge: "1",
              click_action: url + "" + click_action
            };
            // create email body
            let msgHTML =
              "<b>Dear " + journalUserName + ",</b><br><br>";
            msgHTML += userName + " commented on your " + notificationType +
            " about: " + notificationTitle + "<br><br>";
            msgHTML += "<br>";
            msgHTML += "<b>Best Regards,</b> <br>";
            msgHTML += "<b>Global Leadership Platform.</b><br>";

            let msgPlain = "Dear " + journalUserName + ",";
            msgPlain += userName + " commented on your " + notificationType +
            " about: " + notificationTitle;
            msgPlain += "";
            msgPlain += "Best Regards,";
            msgPlain += "Global Leadership Platform.";

            var subject = "New Comment from "+userName;

            var options = {
              to: "",
              to_user: postObj.journalUserID,
              subject: subject,
              msgTxt: msgPlain,
              msgHTML: msgHTML,
              photoURL: photoURL,
              notificationMsg: userName + " commented on your " + notificationType,
              userName: userName,
              notificationURL: click_action,
              companyURL: ""
            };
            console.log("send email notify: ", options);
            console.log("new comments notification obj: ", notificationData);

            userToken.sendSingleMail(options);

            //  let device_tokens = admin.database().ref('user').orderByChild('userID')
            // .equalTo(journalUserID).once('value')

            // device_tokens.then(snap => {
            //   snap.forEach(function(childSnapshot) {

            //     var childKey = childSnapshot.key;
            //     var childData = childSnapshot.val();

            //     var notification_key = childData.notification_key;

            //     if(notification_key == undefined){
            //       console.log("undefined key for user to send comment notification ",journalUserID)
            //     }else{
            //       var msg = {
            //         "notification_key": notification_key,
            //         payload: payload
            //       }
            //       userToken.send(msg);
            //     }

            //   });

            // }).catch(err => {
            //   console.log('Tokens Error: ', err);
            // })

            var newNotificationID = admin
              .database()
              .ref()
              .child("users/" + journalUserID + "/notifications")
              .push().key;
            notificationData.newNotificationID = newNotificationID;
            // Write the new notification's data
            var updates = {};
            updates[
              "users/" + journalUserID + "/notifications/" + newNotificationID
            ] = notificationData;

            admin
              .database()
              .ref()
              .update(updates)
              .then(commentsupdate => {
                console.log("comments notification");
              })
              .catch(comments_err => {
                console.log("comments notification error", comments_err);
              });
          } //End commenting user != posting user
        });
      })
      .catch(err => {
        console.log("error comments in", err);
      });
  });
