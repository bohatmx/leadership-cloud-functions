const functions = require("firebase-functions");
const admin = require("firebase-admin");
var handleNotifications = require("./handle-notifications");
var newNotifications = new handleNotifications();

exports.sendUnsentMails = functions.https.onRequest((req, res) => {
  admin
    .database()
    .ref("/newMails")
    .orderByChild("mail_status")
    .equalTo("unsent")
    .once("value")
    .then(function(snap) {
      snap.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        newNotifications.sendNewMails(childData.mail_options);
        console.log("mail key: ", key, " childData: ", childData.mail_options);
      });
    });
});
