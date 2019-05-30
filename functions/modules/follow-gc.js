const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config.js");
var url = config.url[config.environment];

exports.followCreated = functions.database
  .ref("/followGC/{followID}")
  .onCreate((snap, context) => {
    var follower = snap.val();
    const userID = follower.userID;
    var photoURL = "";
    var myPhoto = "";
    var companyID = follower.companyID;
    var followDate = Date.now();

    var companyID_userType = companyID + "_4";

    var mydata = {
      firstName: follower.firstName,
      lastName: follower.lastName,
      companyName: follower.companyName,
      dateRegistered: followDate,
      photoURL: myPhoto,
      userID: userID
    };

    // If Company == EDCON set correct GC for the dept
    if (companyID === "-LOs4iZh3Y9LSiNtpWlH") {
      var ceo_id = follower.ceo_id;
      var ce_id = follower.ce_id;

      // update CEO Details
      admin
        .database()
        .ref("/user")
        .child(ceo_id)
        .once("value")
        .then(function(snapshot) {
          let childKey = snapshot.key;
          let childData = snapshot.val();
          let userType = childData.userType;
          let honoraryUserID = childData.userID;

          let ceodata = {
            firstName: childData.firstName,
            lastName: childData.lastName,
            companyName: childData.companyName,
            dateRegistered: followDate,
            photoURL: photoURL,
            userID: honoraryUserID
          };

          let updates = {};
          updates["users/" + userID + "/following/" + honoraryUserID] = ceodata;
          updates["users/" + honoraryUserID + "/follower/" + userID] = mydata;
          updates["followers/" + honoraryUserID + "/" + userID] = mydata;

          // console.log("updates: ", updates);

          admin
            .database()
            .ref()
            .update(updates)
            .then(() => {
              console.log(
                "Following successful userID: " +
                  userID +
                  " CEO ID: " +
                  honoraryUserID
              );
            })
            .catch(posts_err => {
              console.error(
                "Following Error userID: " +
                  userID +
                  " CEO ID: " +
                  honoraryUserID
              );
            });
        });

      // update CE Details
      admin
        .database()
        .ref("/user")
        .child(ce_id)
        .once("value")
        .then(function(snapshota) {
          let childKey = snapshota.key;
          var CEchildData = snapshota.val();
          let userType = CEchildData.userType;
          let CEUserID = CEchildData.userID;

          let cedata = {
            firstName: CEchildData.firstName,
            lastName: CEchildData.lastName,
            companyName: CEchildData.companyName,
            dateRegistered: followDate,
            photoURL: photoURL,
            userID: CEUserID
          };

          let ceupdates = {};
          ceupdates["users/" + userID + "/following/" + CEUserID] = cedata;
          ceupdates["users/" + CEUserID + "/follower/" + userID] = mydata;
          ceupdates["followers/" + CEUserID + "/" + userID] = mydata;

          // console.log("ceupdates: ", ceupdates)

          admin
            .database()
            .ref()
            .update(ceupdates)
            .then(() => {
              console.log(
                "Following successful userID: " + userID + " CE ID: " + CEUserID
              );
            })
            .catch(posts_err => {
              console.error(
                "Following Error userID: " + userID + " CE ID: " + CEUserID
              );
            });
        });
    } else {
      const refThoughts = admin.database().ref("/user");
      refThoughts
        .orderByChild("companyID_userType")
        .equalTo(companyID_userType)
        .once("value")
        .then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var userType = childData.userType;
            var honoraryUserID = childData.userID;

            var theirdata = {
              firstName: childData.firstName,
              lastName: childData.lastName,
              companyName: childData.companyName,
              dateRegistered: followDate,
              photoURL: photoURL,
              userID: honoraryUserID
            };

            if (userType === 4 && honoraryUserID !== userID) {
              var updates = {};
              updates[
                "users/" + userID + "/following/" + honoraryUserID
              ] = theirdata;
              updates[
                "users/" + honoraryUserID + "/follower/" + userID
              ] = mydata;
              updates["followers/" + honoraryUserID + "/" + userID] = mydata;

              admin
                .database()
                .ref()
                .update(updates)
                .then(() => {
                  console.log(
                    "Following successful userID: " +
                      userID +
                      " GC ID: " +
                      honoraryUserID
                  );
                })
                .catch(posts_err => {
                  console.error(
                    "Following Error userID: " +
                      userID +
                      " GC ID: " +
                      honoraryUserID
                  );
                });
            }
          });
        });
    }

    return snap.ref.remove();
  });
