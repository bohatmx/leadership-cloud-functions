const functions = require("firebase-functions");
const admin = require("firebase-admin");
var handleNotifications = require("./handle-notifications");
var newNotifications = new handleNotifications();

exports.sendUnsentMails = functions.https.onRequest((req, res) => {
  var listofnewemails = [];
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
        listofnewemails.push(childData.mail_options)
        console.log("mail key: ", key, " childData: ", childData.mail_options);
      });
      if (listofnewemails && listofnewemails.length > 0) {
        newNotifications.sendNewMails(listofnewemails, "unsent");
      }
    });
});
