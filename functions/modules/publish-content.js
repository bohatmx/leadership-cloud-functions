const functions = require("firebase-functions");
const admin = require("firebase-admin");

var InfiniteLoop = require("infinite-loop");
var handleNotifications = require("./handle-notifications");
var userToken = new handleNotifications();

exports.publishContent = functions.https.onRequest((req, res) => {
  var tl = new InfiniteLoop();
  tl.stop();
  tl.add(myLoops);
  tl.setInterval(55000);
  tl.run();
  tl.onError(function(error) {
    console.log("Test Loops", error);
  });

  // res.send(true);
});

function myLoops() {
  publishScheduledContent();
}

// Publish new Thoughts, new Articles, new Videos, new Podcasts, new Voicemails
function publishScheduledContent() {
  var d = Date.now();
  var e = new Date(d);
  e.setSeconds(0, 0);
  var newDate = Date.parse(e);
  var checkStatus = "unpublished";

  // Get a reference to the database service

  // publish new Thoughts
  const refThoughts = admin.database().ref("/dailyThoughts");
  refThoughts
    .orderByChild("status")
    .equalTo(checkStatus)
    .once("value")
    .then(function(snapshot) {
      // console.log("snapshot: ", snapshot)

      snapshot.forEach(function(childSnapshot) {
        // console.log("child snapshot: ", childSnapshot)

        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        var dateScheduled = childData.dateScheduled;
        console.log("dateScheduled: ", dateScheduled);
        console.log("newDate: ", newDate);

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/dailyThoughts').push().key;
          var newItemID = childData.dailyThoughtID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = "approved";
          var topLeader_status = childData.topLeader_status;
          var publish_status = childData.publish_status;
          var companyID_status = companyID + "_" + status;

          // set publish status
          if (publish_status === "hc_unpublished")
            publish_status = "hc_" + status;
          else if (publish_status === "daily_unpublished")
            publish_status = "daily_" + status;
          else if (publish_status === "-LEiZPT-C2PyLu_YLKNU_unpublished")
            publish_status = "-LEiZPT-C2PyLu_YLKNU_" + status;
          else if (publish_status === companyID + "_ilead_unpublished") {
            publish_status = companyID + "_ilead_" + status;
            companyID_status = "corporate_ilead_" + status;
          } else publish_status = companyID + "_" + status;

          // set the new dailythought ID
          childData.dailyThoughtID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + "_" + status;
          childData.status = status;
          childData.companyID_status = companyID_status;
          childData.topLeader_status = topLeader_status + "_" + status;
          childData.publish_status = publish_status;

          // Write the new notification's data
          // var updates = {};
          // updates["/dailyThoughts/" + newItemID] = childData;

          var newPost = {
            post: childData,
            postType: "thought"
          };

          admin
            .database()
            .ref()
            .child("/removePosts")
            .push(newPost);

          // admin
          //   .database()
          //   .ref("dailyThoughts/" + childKey)
          //   .set(null)
          //   .then(() => {
          //     admin
          //       .database()
          //       .ref()
          //       .update(updates)
          //       .then(update_res => {
          //         console.log(
          //           "Success updating daily thoughts published id: " +
          //             newItemID +
          //             " old id: " +
          //             childKey
          //         );
          //       })
          //       .catch(error => {
          //         console.log(
          //           "Error updating daily thoughts published id " + newItemID
          //         );
          //       });
          //   });

          // console.log("published thought " + newItemID);
        }
      });
    })
    .catch(error => {
      console.log("Error releasing thoughts", error);
    });

  // publish new Articles
  const refArticles = admin.database().ref("/news");
  refArticles
    .orderByChild("status")
    .equalTo(checkStatus)
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var dateScheduled = childData.dateScheduled;

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/news').push().key;
          var newItemID = childData.newsID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = "approved";
          var topLeader_status = childData.topLeader_status;

          childData.newsID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + "_" + status;
          childData.status = status;
          childData.companyID_status = companyID + "_" + status;
          childData.topLeader_status = topLeader_status + "_" + status;

          var newPost = {
            post: childData,
            postType: "article"
          };

          admin
            .database()
            .ref()
            .child("/removePosts")
            .push(newPost);

          // Write the new notification's data
          // var updates = {};
          // updates["/news/" + newItemID] = childData;

          // admin
          //   .database()
          //   .ref("news/" + childKey)
          //   .set(null)
          //   .then(() => {
          //     admin
          //       .database()
          //       .ref()
          //       .update(updates)
          //       .then(update_res => {
          //         console.log(
          //           "Success updating articles published id: " +
          //             newItemID +
          //             " old id " +
          //             childKey
          //         );
          //       })
          //       .catch(error => {
          //         console.log(
          //           "Error updating articles published id " + childKey
          //         );
          //       });
          //   });

          // console.log("published articles " + newItemID);
        }
      });
    })
    .catch(error => {
      console.log("Error releasing articles", error);
    });

  // publish new Podcasts
  const refPodcasts = admin.database().ref("/podcasts");
  refPodcasts
    .orderByChild("status")
    .equalTo(checkStatus)
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var dateScheduled = childData.dateScheduled;

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/podcasts').push().key;
          var newItemID = childData.podcastID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = "approved";
          var topLeader_status = childData.topLeader_status;

          childData.podcastID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + "_" + status;
          childData.status = status;
          childData.companyID_status = companyID + "_" + status;
          childData.topLeader_status = topLeader_status + "_" + status;
          childData.company_status = "general_true";

          var newPost = {
            post: childData,
            postType: "podcast"
          };

          admin
            .database()
            .ref()
            .child("/removePosts")
            .push(newPost);

          // Write the new notification's data
          // var updates = {};
          // updates["/podcasts/" + newItemID] = childData;

          // // console.log(updates);
          // admin
          //   .database()
          //   .ref("podcasts/" + childKey)
          //   .set(null)
          //   .then(() => {
          //     admin
          //       .database()
          //       .ref()
          //       .update(updates)
          //       .then(update_res => {
          //         console.log(
          //           "Success updating voicemails published id" +
          //             newItemID +
          //             " old id: " +
          //             childKey
          //         );
          //       })
          //       .catch(error => {
          //         console.log(
          //           "Error updating voicemails published id " + childKey
          //         );
          //       });
          //   });

          console.log("published podcast/voicemail " + newItemID);
        }
      });
    })
    .catch(error => {
      console.log("Error releasing podcasts", error);
    });

  // publish new Videos
  const refVideos = admin.database().ref("/videos");
  refVideos
    .orderByChild("status")
    .equalTo(checkStatus)
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var dateScheduled = childData.dateScheduled;

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/videos').push().key;
          var newItemID = childData.videoID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = "approved";
          var topLeader_status = childData.topLeader_status;

          childData.videoID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + "_" + status;
          childData.status = status;
          childData.companyID_status = companyID + "_" + status;
          childData.topLeader_status = topLeader_status + "_" + status;
          childData.company_status = "general_true";

          var newPost = {
            post: childData,
            postType: "video"
          };

          admin
            .database()
            .ref()
            .child("/removePosts")
            .push(newPost);

          // Write the new notification's data
          // var updates = {};
          // updates["/videos/" + newItemID] = childData;

          // // console.log(updates);
          // admin
          //   .database()
          //   .ref("videos/" + childKey)
          //   .set(null)
          //   .then(() => {
          //     admin
          //       .database()
          //       .ref()
          //       .update(updates)
          //       .then(update_res => {
          //         console.log(
          //           "Success updating videos published id" +
          //             newItemID +
          //             " old id: " +
          //             childKey
          //         );
          //       })
          //       .catch(error => {
          //         console.log("Error updating videos published id " + childKey);
          //       });
          //   });

          console.log("published videos " + childKey);
        }
      });
    })
    .catch(error => {
      console.log("Error releasing videos", error);
    });

    // publish new group posts
  const refGroupPosts= admin.database().ref("/group-posts-unpublished");
  refGroupPosts
    .orderByChild("status")
    .equalTo(checkStatus)
    .once("value")
    .then(function(snapshot) {
      // console.log("snapshot: ", snapshot)

      snapshot.forEach(function(childSnapshot) {
        // console.log("child snapshot: ", childSnapshot)

        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        var dateScheduled = childData.dateScheduled;
        console.log("dateScheduled: ", dateScheduled);
        console.log("newDate: ", newDate);

        if (dateScheduled <= newDate) {
          // var newItemID = admin.database().ref().child('/dailyThoughts').push().key;
          var newItemID = childData.dailyThoughtID;

          var dailyThoughtType = childData.dailyThoughtType;
          var companyID = childData.companyID;
          var status = "approved";
          var topLeader_status = childData.topLeader_status;
          var publish_status = childData.publish_status;
          var companyID_status = companyID + "_" + status;

          // set publish status
          publish_status = companyID + "_" + status;

          // set the new dailythought ID
          childData.dailyThoughtID = newItemID;

          childData.dailyThoughtType_status = dailyThoughtType + "_" + status;
          childData.status = status;
          childData.companyID_status = companyID_status;
          childData.topLeader_status = topLeader_status + "_" + status;
          childData.publish_status = publish_status;
          childData.postGroupType_status = childData.postGroupType+"_"+status;
          childData.GroupType_status = companyID + "_" + childData.postGroupType_status;

          // Write the new notification's data
          var updates = {};
          updates["group-posts/"+childData.groupid+"/"+childData.postID] = childData;

          admin.database()
            .ref()
            .update(updates)
            .then(update_res => {
              console.log(
                "Success updating groups post published id: " +
                childData.postID
              );

              childSnapshot.ref.remove();
            })
            .catch(error => {
              console.log(
                "Error updating posts published id " + childData.postID
              );
            });
        }
      });
    })
    .catch(error => {
      console.log("Error releasing thoughts", error);
    });


  console.log("running publishing content");
  // end publish new content
}


// // send notifications to group users
// function sendNotificationsPublishedContent(newPost){
 
//   var groupid = newPost.groupid;
//   var postID = newPost.postID;
//   console.log("post to publish: ", newPost);

//   // get comapny id
//   var companyID = newPost.companyID;
//   var companyName = newPost.companyName;
//   var postGroupType = newPost.postGroupType;
//   var journalUserID = "";
//   var journalUserName = "";
//   var notificationDate = Date.now();
//   var notificationItemID = postID;
//   var photoURL = "";
//   var dailyThoughtType_status = newPost.dailyThoughtType_status;
//   var status = newPost.status;
//   var emailMsg = "";
//   var subject = "";

//   // check if post is approved
//   if(status == "approved"){
//     // get title and subtitle from post object
//     var body = "";
//     var subtitle = "";

//     //user photo
//     if (newPost.photoURL != undefined || newPost.photoURL != "") {
//       photoURL = newPost.photoURL;
//     } else {
//       photoURL =
//         "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
//     }

//     if (photoURL == undefined || photoURL == "") {
//       photoURL =
//         "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
//     }

//     if (postGroupType.trim().toLowerCase() === "thoughts") {
//       body = newPost.title;
//       subtitle = newPost.subtitle;
//       journalUserID = newPost.journalUserID;
//       journalUserName = newPost.journalUserName;

//       emailMsg = journalUserName + " posted a thought by " + subtitle;
//       subject = journalUserName + " posted a new thought";

//       var notificationData = {
//         notificationItemID: notificationItemID,
//         notificationType: "thought",
//         postGroupType: postGroupType,
//         groupid: groupid,
//         notificationMsg: emailMsg,
//         journalUserID: journalUserID,
//         journalUserName: journalUserName,
//         photoURL: photoURL,
//         notificationDate: notificationDate,
//         seen: false,
//         opened: false,
//         companyID: companyID,
//         companyName: companyName
//       };

//     } else if (postGroupType.trim().toLowerCase() === "articles") {
//       body = newPost.title;
//       subtitle = newPost.subtitle;
//       journalUserID = newPost.journalUserID;
//       journalUserName = newPost.journalUserName;

//       emailMsg = journalUserName + ' posted an article about: "' + body + '"';
//       subject = journalUserName + ' posted a new article';

//       var notificationData = {
//         notificationItemID: notificationItemID,
//         notificationType: "article",
//         postGroupType: postGroupType,
//         groupid: groupid,
//         notificationMsg: emailMsg,
//         journalUserID: journalUserID,
//         journalUserName: journalUserName,
//         photoURL: photoURL,
//         notificationDate: notificationDate,
//         seen: false,
//         opened: false,
//         companyID: companyID,
//         companyName: companyName
//       }

//     } else if (postGroupType.trim().toLowerCase() === "podcasts") {
//       body = newPost.title;
//       subtitle = newPost.subtitle;
//       journalUserID = newPost.userID;
//       journalUserName = newPost.userName;
//       var podcastDescription = podcast.podcastDescription;

//       emailMsg = journalUserName + ' posted a ' + podcastDescription.toLowerCase() + ' about: "' + body + '"'
//       subject = journalUserName + ' shared a new ' + podcastDescription.toLowerCase();

//       var notificationData = {
//         notificationItemID: notificationItemID,
//         notificationType: "podcast",
//         postGroupType: postGroupType,
//         groupid: groupid,
//         notificationMsg: emailMsg,
//         journalUserID: journalUserID,
//         journalUserName: journalUserName,
//         photoURL: photoURL,
//         notificationDate: notificationDate,
//         seen: false,
//         opened: false,
//         companyID: companyID,
//         companyName: companyName
//       }

//     } else if (postGroupType.trim().toLowerCase() === "videos") {
//       body = newPost.title;
//       subtitle = newPost.subtitle;
//       journalUserID = newPost.userID;
//       journalUserName = newPost.userName;

//       emailMsg = journalUserName + ' posted a video about: "' + title + '"';
//       subject = journalUserName + " shared a new video"

//       var notificationData = {
//         notificationItemID: notificationItemID,
//         notificationType: "video",
//         postGroupType: postGroupType,
//         groupid: groupid,
//         notificationMsg: emailMsg,
//         journalUserID: journalUserID,
//         journalUserName: journalUserName,
//         photoURL: photoURL,
//         notificationDate: notificationDate,
//         seen: false,
//         opened: false,
//         companyID: companyID,
//         companyName: companyName
//       };

//       var UploadExternal = newPost.UploadExternal;

//       if (UploadExternal === "external") {
//         var url_init = video.url;
//         var self = this;

//         //todo: facebook and twitter use oemembed

//         if (url_init.includes(".ted.com")) {
//           //embed normal video
//           self.video_embed_ted(url_init, snap.key, groupid);
//         } else {
//           //embed shorten video
//           self.video_embed_unshorten_ted(url_init, snap.key, groupid);
//         }
//       }
//     }

//     // Prepare email notification
//     let msgPlain = emailMsg;
//     msgPlain += "Best Regards,";
//     msgPlain += "Global Leadership Platform.";

//     var all = true;

//     var options = {
//       subject: subject,
//       msgTxt: msgPlain,
//       msgHTML: "",
//       photoURL: photoURL,
//       notificationMsg: emailMsg,
//       userName: journalUserName,
//       notificationURL: "filtered-group-posts/#/" + groupid + "/" + notificationItemID,
//       userID: journalUserID,
//       companyID: companyID,
//       all: all,
//       groupid: groupid
//     };

//     var newNotification = userToken.createNotifications(
//       all,
//       options,
//       notificationData
//     );
//   }
//   // end post not approved
// }

// this.video_embed_unshorten_ted = function(url_init, key, groupid) {
//   var self = this;
//   uu.expand(url_init)
//     .then(url => {
//       console.log("unshortening url");
//       self.video_embed_ted(url, key, groupid);
//     })
//     .catch(err => {
//       console.log("i am sure this is the error: ", err);
//     });
// };

// this.video_embed_ted = function(url, key, groupid) {
//   console.log("embedding normal url (whether shortend or unshortend)");

//   curl.get(url, {}, function(err, response, body) {
//     var updatedurl = "https://embed.ted.com" + response.request.uri.pathname;
//     var updateURL = {};
//     updateURL["group-posts/"+groupid+"/" + key + "/url"] = updatedurl;

//     admin
//       .database()
//       .ref()
//       .update(updateURL)
//       .then(postsupdate => {
//         console.log("update url");
//       })
//       .catch(posts_err => {
//         console.log("update url videos error", posts_err);
//       });
//   });
// };