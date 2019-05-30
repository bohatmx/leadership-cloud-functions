const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config.js");
var url = config.url[config.environment];

exports.updateUserURL = functions.database
  .ref("/users/{userID}")
  .onCreate((snap, context) => {
    var user = snap.val();
    const userID = snap.key;

    if (userID != undefined) {
      var TinyURL = require("tinyurl");
      var uid = user.uid;

      console.log("Create TinyURL for userID: " + userID + "  uid: " + uid);

      if (uid != undefined) {
        var userURL = url + "#/lead/" + userID + "/sign-up";

        TinyURL.shorten(userURL, function(res) {
          var updates = {};
          updates["users/" + userID + "/userURL"] = res;
          updates["user/" + uid + "/userURL"] = res;

          admin
            .database()
            .ref()
            .update(updates)
            .then(postsupdate => {
              console.log("User URL updated successfully : ", userID);
            })
            .catch(posts_err => {
              console.log("Error updating user URL: ", userID);
            });
        });
      } //End if uid not undefined
    } //End if userID not undefined
  });
