const functions = require("firebase-functions");
const admin = require("firebase-admin");

var handleNotifications = require("./handle-notifications");
var userToken = new handleNotifications();

// on create or update daily thoughts
exports.newGroupPosts = functions.database
  .ref("/group-posts/{groupid}/{postID}")
  .onCreate((snap, context) => {
    // Get Firebase object
    var newPost = snap.val();
    var groupid = context.params.groupid;
    var postID = context.params.postID;
    console.log("created: ", newPost);

    // get comapny id
    var companyID = newPost.companyID;
    var companyName = newPost.companyName;
    var postGroupType = newPost.postGroupType;
    var journalUserID = "";
    var journalUserName = "";
    var notificationDate = Date.now();
    var notificationItemID = postID;
    var photoURL = "";
    var dailyThoughtType_status = newPost.dailyThoughtType_status;
    var status = newPost.status;
    var emailMsg = "";
    var subject = "";

    // check if post is approved
    if(status == "approved"){
      // get title and subtitle from post object
      var body = "";
      var subtitle = "";

      //user photo
      if (newPost.photoURL != undefined || newPost.photoURL != "") {
        photoURL = newPost.photoURL;
      } else {
        photoURL =
          "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }

      if (photoURL == undefined || photoURL == "") {
        photoURL =
          "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }

      if (postGroupType.trim().toLowerCase() === "thoughts") {
        body = newPost.title;
        subtitle = newPost.subtitle;
        journalUserID = newPost.journalUserID;
        journalUserName = newPost.journalUserName;

        emailMsg = journalUserName + " posted a thought by " + subtitle;
        subject = journalUserName + " posted a new thought";

        var notificationData = {
          notificationItemID: notificationItemID,
          notificationType: "thought",
          postGroupType: postGroupType,
          groupid: groupid,
          notificationMsg: emailMsg,
          journalUserID: journalUserID,
          journalUserName: journalUserName,
          photoURL: photoURL,
          notificationDate: notificationDate,
          seen: false,
          opened: false,
          companyID: companyID,
          companyName: companyName
        };

      } else if (postGroupType.trim().toLowerCase() === "articles") {
        body = newPost.title;
        subtitle = newPost.subtitle;
        journalUserID = newPost.journalUserID;
        journalUserName = newPost.journalUserName;

        emailMsg = journalUserName + ' posted an article about: "' + body + '"';
        subject = journalUserName + ' posted a new article';

        var notificationData = {
          notificationItemID: notificationItemID,
          notificationType: "article",
          postGroupType: postGroupType,
          groupid: groupid,
          notificationMsg: emailMsg,
          journalUserID: journalUserID,
          journalUserName: journalUserName,
          photoURL: photoURL,
          notificationDate: notificationDate,
          seen: false,
          opened: false,
          companyID: companyID,
          companyName: companyName
        }

      } else if (postGroupType.trim().toLowerCase() === "podcasts") {
        body = newPost.title;
        subtitle = newPost.subtitle;
        journalUserID = newPost.userID;
        journalUserName = newPost.userName;
        var podcastDescription = podcast.podcastDescription;

        emailMsg = journalUserName + ' posted a ' + podcastDescription.toLowerCase() + ' about: "' + body + '"'
        subject = journalUserName + ' shared a new ' + podcastDescription.toLowerCase();

        var notificationData = {
          notificationItemID: notificationItemID,
          notificationType: "podcast",
          postGroupType: postGroupType,
          groupid: groupid,
          notificationMsg: emailMsg,
          journalUserID: journalUserID,
          journalUserName: journalUserName,
          photoURL: photoURL,
          notificationDate: notificationDate,
          seen: false,
          opened: false,
          companyID: companyID,
          companyName: companyName
        }

      } else if (postGroupType.trim().toLowerCase() === "videos") {
        body = newPost.title;
        subtitle = newPost.subtitle;
        journalUserID = newPost.userID;
        journalUserName = newPost.userName;

        emailMsg = journalUserName + ' posted a video about: "' + title + '"';
        subject = journalUserName + " shared a new video"

        var notificationData = {
          notificationItemID: notificationItemID,
          notificationType: "video",
          postGroupType: postGroupType,
          groupid: groupid,
          notificationMsg: emailMsg,
          journalUserID: journalUserID,
          journalUserName: journalUserName,
          photoURL: photoURL,
          notificationDate: notificationDate,
          seen: false,
          opened: false,
          companyID: companyID,
          companyName: companyName
        };

        var UploadExternal = newPost.UploadExternal;

        if (UploadExternal === "external") {
          var url_init = video.url;
          var self = this;

          //todo: facebook and twitter use oemembed

          if (url_init.includes(".ted.com")) {
            //embed normal video
            self.video_embed_ted(url_init, snap.key, groupid);
          } else {
            //embed shorten video
            self.video_embed_unshorten_ted(url_init, snap.key, groupid);
          }
        }
      }

      // Prepare email notification
      let msgPlain = emailMsg;
      msgPlain += "Best Regards,";
      msgPlain += "Global Leadership Platform.";

      var all = true;

      var options = {
        subject: subject,
        msgTxt: msgPlain,
        msgHTML: "",
        photoURL: photoURL,
        notificationMsg: emailMsg,
        userName: journalUserName,
        notificationURL: "filtered-group-posts/#/" + groupid + "/" + notificationItemID,
        userID: journalUserID,
        companyID: companyID,
        all: all,
        groupid: groupid
      };

      var newNotification = userToken.createNotifications(
        all,
        options,
        notificationData
      );
    }
    // end post not approved

  });

  this.video_embed_unshorten_ted = function(url_init, key, groupid) {
    var self = this;
    uu.expand(url_init)
      .then(url => {
        console.log("unshortening url");
        self.video_embed_ted(url, key, groupid);
      })
      .catch(err => {
        console.log("i am sure this is the error: ", err);
      });
  };
  
  this.video_embed_ted = function(url, key, groupid) {
    console.log("embedding normal url (whether shortend or unshortend)");
  
    curl.get(url, {}, function(err, response, body) {
      var updatedurl = "https://embed.ted.com" + response.request.uri.pathname;
      var updateURL = {};
      updateURL["group-posts/"+groupid+"/" + key + "/url"] = updatedurl;
  
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
