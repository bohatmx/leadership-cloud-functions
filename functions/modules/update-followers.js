const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.updateFollowers = functions.https.onRequest((req, res) => {
  admin
    .database()
    .ref("/users")
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var followers = childData.follower;

        if (followers != undefined && childKey != "user") {
          // var followerkey = followers.key;
          // console.log("followers: ", followers);
          // for (var x in followers) {
          //   console.log("parent key: ", childKey, "childkey:", x);
          // }
          admin
            .database()
            .ref("/followers/" + childKey)
            .set(followers)
            .then(res => {
              console.log("update user followers: ", childKey);
            })
            .catch(err => {
              console.log("err: ", childKey);
            });
        }

        // console.log("child key: ", childKey);
        // console.log("child followers: ", followers);
        // console.log("child data: ", childData);
      });

      return true;
    });
});
