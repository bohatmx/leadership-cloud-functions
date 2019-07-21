const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.cleanFollowers = functions.https.onRequest((req, res) => {
  admin
    .database()
    .ref("/followers")
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        // console.log("parent key: ", snapshot.key, " child key: ", childKey);
        //var followers = childData.follower;

        if (childKey != undefined && childKey != "user") {
          // var followerkey = followers.key;
          // console.log("followers: ", followers);
          for (var x in childData) {
            var email = childData[x].email;

            if (email == undefined || email == "") {
              console.log(
                "missing email parent key: ",
                childKey,
                "childkey:",
                email
              );
              var res = updateFollowerDetails(childKey, x);
            }
          }
          // admin
          //   .database()
          //   .ref("/followers/" + childKey)
          //   .set(followers)
          //   .then(res => {
          //     console.log("update user followers: ", childKey);
          //   })
          //   .catch(err => {
          //     console.log("err: ", childKey);
          //   });
        }

        // console.log("child key: ", childKey);
        // console.log("child followers: ", followers);
        // console.log("child data: ", childData);
      });

      return true;
    });
});

function updateFollowerDetails(parentID, userID) {
  return admin
    .database()
    .ref("/users/" + userID)
    .once("value")
    .then(function(snapshot) {
      console.log("userID: " + userID);
      console.log("user sanpshot: " + snapshot.val());

      var email = (snapshot.val() && snapshot.val().email) || "";
      var companyID = (snapshot.val() && snapshot.val().companyID) || "";

      if (email != undefined || email != "") {
        if (email.length == 0) {
          // snapRef.remove();
          return snapshot;
        }

        var updates = {};

        updates["followers/" + parentID + "/" + userID + "/email"] = email;
        updates[
          "followers/" + parentID + "/" + userID + "/companyID"
        ] = companyID;

        // console.log("receiveEmails true update: ", receiveEmails);
        return admin
          .database()
          .ref()
          .update(updates)
          .then(res => {
            console.log("updated follower record: ", userID);
          })
          .catch(err => {
            console.log(
              "error updated follower record: ",
              userID,
              " ==> ",
              err
            );
          });
      }

      return snapshot;
    });
}
