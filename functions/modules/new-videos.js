const functions = require("firebase-functions");
const admin = require("firebase-admin");
var curl = require("curl");
let uu = require("url-unshort")();

var handleNotifications = require("./handle-notifications");
var userToken = new handleNotifications();

// on create or update videos
exports.newVideos = functions.database
  .ref("/videos/{videoID}")
  .onCreate((snap, context) => {
    // Get Firebase object
    var video = snap.val();
    // Specify Algolia's objectID using the Firebase object key
    video.objectID = snap.key;
    var UploadExternal = video.UploadExternal;

    // get title and subtitle from thought object
    var company_status = video.company_status;

    // daily thought type status - 1_approved (internal approved), 2_approved (external approved)
    var dailyThoughtType_status = video.dailyThoughtType_status;

    if (company_status == "general_true" || company_status == "general_false") {
      var title = video.title;

      var journalUserID = video.userID;
      var journalUserName = video.userName;
      var notificationDate = Date.now();
      var notificationItemID = snap.key;
      var photoURL = "";
      var companyID = video.companyID;
      var companyName = video.companyName;

      var updateOwner = {};
      updateOwner["videos/" + snap.key + "/postOwner"] = journalUserID;
      admin
        .database()
        .ref()
        .update(updateOwner)
        .then(postsupdate => {
          console.log("updateOwner videos");
        })
        .catch(posts_err => {
          console.log("updateOwner videos error");
        });

      if (video.photoURL != undefined || video.photoURL != "") {
        photoURL = video.photoURL;
      } else {
        photoURL =
          "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }

      if (photoURL == undefined) {
        photoURL =
          "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }

      var notificationData = {
        notificationItemID: notificationItemID,
        notificationType: "video",
        notificationMsg:
          journalUserName + ' posted a video about: "' + title + '"',
        journalUserID: journalUserID,
        journalUserName: journalUserName,
        photoURL: photoURL,
        notificationDate: notificationDate,
        seen: false,
        opened: false,
        companyID: companyID,
        companyName: companyName
      };

      // Prepare email notification
      let msgPlain = journalUserName + " posted a video about " + title;
      msgPlain += "";
      msgPlain += "Best Regards,";
      msgPlain += "Global Leadership Platform.";

      var subject = journalUserName + " shared a new video";

      // start external/global approved 2_approved
      if (dailyThoughtType_status === "2_approved") {
        var all = true;

        var options = {
          subject: subject,
          msgTxt: msgPlain,
          msgHTML: "",
          photoURL: photoURL,
          notificationMsg: journalUserName + " posted a video about " + title,
          userName: journalUserName,
          notificationURL: "filtered-videos?fromemail=true/#/" + notificationItemID,
          userID: journalUserID,
          companyID: companyID,
          all: all,
          notificationType: 'video',
          postID: notificationItemID
        };

        // Add count to users analytics for thoughts
        let countItems = admin
          .database()
          .ref("users")
          .child(journalUserID)
          .child("analytics")
          .child("videos");
        let currentCount = countItems.transaction(function(current) {
          return (current || 0) + 1;
        });

        var newNotification = userToken.createNotifications(
          all,
          options,
          notificationData
        );
        // return true;
      } // end of 2_approved
      // start internal approved (1_approved)
      if (dailyThoughtType_status === "1_approved") {
        var all = false;

        var options = {
          subject: subject,
          msgTxt: msgPlain,
          msgHTML: "",
          photoURL: photoURL,
          notificationMsg: journalUserName + " posted a video about " + title,
          userName: journalUserName,
          notificationURL: "filtered-videos?fromemail=true/#/" + notificationItemID,
          userID: journalUserID,
          companyID: companyID,
          all: all,
          notificationType: 'video',
          postID: notificationItemID
        };

        // Add count to users analytics for thoughts
        let countItems = admin
          .database()
          .ref("users")
          .child(journalUserID)
          .child("analytics")
          .child("videos");
        let currentCount = countItems.transaction(function(current) {
          return (current || 0) + 1;
        });

        var newNotification = userToken.createNotifications(
          all,
          options,
          notificationData
        );

        // return true;
      }
      // end of 1_approved

      if (UploadExternal === "external") {
        var url_init = video.url;
        var self = this;

        //todo: facebook and twitter use oemembed

        if (url_init.includes(".ted.com")) {
          //embed normal video
          self.video_embed_ted(url_init, snap.key);
        } else {
          //embed shorten video
          self.video_embed_unshorten_ted(url_init, snap.key);
        }
      }
    }
  });

this.video_embed_unshorten_ted = function(url_init, key) {
  var self = this;
  uu.expand(url_init)
    .then(url => {
      console.log("unshortening url");
      self.video_embed_ted(url, key);
    })
    .catch(err => {
      console.log("i am sure this is the error: ", err);
    });
};

this.video_embed_ted = function(url, key) {
  console.log("embedding normal url (whether shortend or unshortend)");

  curl.get(url, {}, function(err, response, body) {
    var updatedurl = "https://embed.ted.com" + response.request.uri.pathname;
    var updateURL = {};
    updateURL["videos/" + key + "/url"] = updatedurl;

    admin
      .database()
      .ref()
      .update(updateURL)
      .then(postsupdate => {
        console.log("update url");
      })
      .catch(posts_err => {
        console.log("update url videos error", posts_err);
      });
  });
};
