
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config.js');
var url = config.url;

exports.followCreated = functions.database.ref('/followGC/{followID}').onCreate((snap, context) => {
    var follower = snap.val();
    const userID = follower.userID;
    var photoURL = "";
    var myPhoto = "";
    var companyID = follower.companyID;
    var followDate = Date.now();

    var companyID_userType = companyID+"_4";

    var mydata = {
      "firstName":follower.firstName,
      "lastName":follower.lastName,
      "companyName":follower.companyName,
      "dateRegistered": followDate,
      "photoURL":myPhoto,
      "userID": userID
    }

    const refThoughts = admin.database().ref('/user');
    refThoughts.orderByChild('companyID_userType')
      .equalTo(companyID_userType)
      .once('value')
      .then(function (snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          var userType = childData.userType;
          var honoraryUserID = childData.userID;

          var theirdata = {
            "firstName":childData.firstName,
            "lastName":childData.lastName,
            "companyName":childData.companyName,
            "dateRegistered":followDate,
            "photoURL":photoURL,
            "userID":honoraryUserID
          }

          if((userType === 4) && (honoraryUserID !== userID)){
            var updates = {}
            updates["users/"+userID+"/following/"+honoraryUserID]=theirdata;
            updates["users/"+honoraryUserID+"/follower/"+userID]=mydata;
            updates["followers/"+honoraryUserID+"/"+userID]=mydata;

            admin.database().ref().update(updates).then(() =>{
              console.log("Following successful userID: "+userID+" GC ID: "+honoraryUserID);
            }).catch(posts_err => {
              console.error("Following Error userID: "+userID+" GC ID: "+honoraryUserID);
            })
          }

      });
    });

    return snap.ref.remove();
  });