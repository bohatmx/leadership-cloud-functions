const functions = require("firebase-functions");
const admin = require("firebase-admin");

var handleNotifications = require("./handle-notifications");
var userToken = new handleNotifications();

// on create or update daily thoughts
exports.newThoughts = functions.database
  .ref("/dailyThoughts/{dailyThoughtID}")
  .onCreate((snap, context) => {
    // Get Firebase object
    var dailythought = snap.val();
    console.log("created: ", dailythought);
    // Specify Algolia's objectID using the Firebase object key
    dailythought.objectID = snap.key;

    // get comapny id
    var companyID = dailythought.companyID;
    var companyName = dailythought.companyName;
    var companyID_status = dailythought.companyID_status;

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
    let countThoughts = admin
      .database()
      .ref("users")
      .child(journalUserID)
      .child("analytics")
      .child("thoughts");
    let currentCount = countThoughts.transaction(function(current) {
      return (current || 0) + 1;
    });

    if (dailythought.photoURL != undefined || dailythought.photoURL != "") {
      photoURL = dailythought.photoURL;
    } else {
      photoURL =
        "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    if (photoURL == undefined || photoURL == "") {
      photoURL =
        "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    // Define Thought type
    var thoughtType = "default";

    // Checks publish thought status
    if (dailythought.publish_status === "daily_approved")
      thoughtType = "dailythoughts";
    else if (dailythought.publish_status === companyID.concat("_approved"))
      thoughtType = "companythoughts";
    else if (dailythought.publish_status === "hc_approved")
      thoughtType = "topleaderthoughts";
    else if (
      dailythought.publish_status === companyID.concat("_ilead_approved")
    )
      thoughtType = "ileadcorporate";
    else if (dailythought.publish_status === "-LEiZPT-C2PyLu_YLKNU_approved")
      // public aa
      thoughtType = "ileadpublic";
    else thoughtType = "default";

    var notificationData = {
      notificationItemID: notificationItemID,
      notificationType: "thought",
      notificationMsg: journalUserName + " posted a thought by " + subtitle,
      journalUserID: journalUserID,
      journalUserName: journalUserName,
      photoURL: photoURL,
      notificationDate: notificationDate,
      seen: false,
      opened: false,
      companyID: companyID,
      companyName: companyName,
      thoughtType: thoughtType
    };

    // start external/global approved 2_approved
    if (
      dailyThoughtType_status === "2_approved" ||
      dailyThoughtType_status === "3_approved"
    ) {
      // Prepare email notification
      let msgPlain = journalUserName + " posted a thought by " + subtitle;
      msgPlain += "";
      msgPlain += "Best Regards,";
      msgPlain += "Global Leadership Platform.";

      var subject = journalUserName + " posted a new thought";

      if (companyID_status === "corporate_ilead_approved") {
        var all = false;
      } else {
        var all = true;
      }

      var options = {
        subject: subject,
        msgTxt: msgPlain,
        msgHTML: "",
        photoURL: photoURL,
        notificationMsg: journalUserName + " posted a thought by " + subtitle,
        userName: journalUserName,
        notificationURL: "filtered-thoughts?fromemail=true/#/" + notificationItemID,
        userID: journalUserID,
        companyID: companyID,
        all: all,
        notificationType: 'thought',
        postID: notificationItemID
      };

      var newNotification = userToken.createNotifications(
        all,
        options,
        notificationData
      );

      return true;
    } // end of 2_approved
    // start internal approved (1_approved)
    if (dailyThoughtType_status === "1_approved") {
      // let tokens = [];
      // Prepare email notification
      let msgPlain = journalUserName + " posted a thought by " + subtitle;
      msgPlain += "";
      msgPlain += "Best Regards,";
      msgPlain += "Global Leadership Platform.";

      var subject = journalUserName + " posted a new thought";

      var all = false;

      if (companyID == "-LEiZPT-C2PyLu_YLKNU") {
        all = true;
      } else if (dailythought.publish_status === "daily_approved") {
        all = true;
      } else {
        all = false;
      }

      var options = {
        subject: subject,
        msgTxt: msgPlain,
        msgHTML: "",
        photoURL: photoURL,
        notificationMsg: journalUserName + " posted a thought by " + subtitle,
        userName: journalUserName,
        notificationURL: "filtered-thoughts?fromemail=true/#/" + notificationItemID,
        userID: journalUserID,
        companyID: companyID,
        all: all,
        notificationType: 'thought',
        postID: notificationItemID
      };

      var newNotification = userToken.createNotifications(
        all,
        options,
        notificationData
      );

      return true;
    }
    // end of 1_approved

    // if thoughts are pending send notification to Admin
    if (status === "pending") {
      var notificationData = {
        notificationItemID: notificationItemID,
        notificationType: "pending-thought",
        notificationMsg:
          journalUserName + " posted a new message requiring your action.",
        journalUserID: journalUserID,
        journalUserName: journalUserName,
        photoURL: photoURL,
        notificationDate: notificationDate,
        seen: false,
        opened: false,
        companyID: companyID,
        companyName: companyName
      };

      var companyID_userType = companyID + "_7";

      let companyAdmins = admin
        .database()
        .ref("/users")
        .orderByChild("companyID_userType")
        .equalTo(companyID_userType)
        .once("value");

      const got_admins = companyAdmins
        .then(snap => {
          snap.forEach(userv => {
            var admin_user = userv.val();
            var admin_key = userv.key;

            let device_tokens = admin
              .database()
              .ref("user")
              .orderByChild("userID")
              .equalTo(admin_key)
              .once("value");

            device_tokens
              .then(snap => {
                snap.forEach(function(childSnapshot) {
                  var childKey = childSnapshot.key;
                  var childData = childSnapshot.val();
                  var url = userToken.getCompanyURL(companyID);

                  var payload = {
                    title: "New Pending Thought",
                    body:
                      journalUserName +
                      " posted a new message requiring your action.",
                    icon: "/images/manifest/icon-48x48.png",
                    sound: "default",
                    badge: 1,
                    click_action: url + "thoughts-management"
                  };

                  var notification_key = childData.notification_key;

                  if (notification_key == undefined) {
                    console.log("undefined key for user: ", admin_key);
                  } else {
                    var msg = {
                      notification_key: notification_key,
                      payload: payload
                    };
                    userToken.send(msg);
                  }
                });
              })
              .catch(err => {
                console.log("Tokens Error: ", err);
              });

            var newNotificationID = admin
              .database()
              .ref()
              .child("users/" + admin_key + "/notifications")
              .push().key;

            notificationData.newNotificationID = newNotificationID;
            // Write the new notification's data
            var updates = {};
            updates[
              "users/" + admin_key + "/notifications/" + newNotificationID
            ] = notificationData;

            admin
              .database()
              .ref()
              .update(updates)
              .then(postsupdate => {
                console.log("pending thoughts notification to admin");
              })
              .catch(posts_err => {
                console.log("pending posts error to admin");
              });
          });

          return true;
        })
        .catch(err => {
          console.log("Pending admins Error: ", err);
        }); //end got_admins
    }
  });
