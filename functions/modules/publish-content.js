const functions = require("firebase-functions");
const admin = require("firebase-admin");

var InfiniteLoop = require("infinite-loop");
// var createPosts = require('./create-posts');
// var removePosts = require('./remove-posts');

// var _createPosts = new createPosts();
// var _removePosts = new removePosts();

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

  console.log("running publishing content");
  // end publish new content
}
