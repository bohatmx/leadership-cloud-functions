const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create or update daily thoughts
exports.newReminderIn = functions.database.ref('/pldpNotifications/{notificationID}').onCreate((snapshot, context) => {
  const reminderObj = snapshot.val();
  const key = snapshot.key;

  var journalUserID = reminderObj.journalUserID;
  var notificationID = reminderObj.notificationID;

  let user = admin.database().ref('users').orderByChild('userID')
  .equalTo(journalUserID).once('value').then((snap) => {
      var userKey = snap.key;
      var userInfo = snap.val();
      var firstName = userInfo[journalUserID].firstName;
      var photoURL = userInfo[journalUserID].photoURL;

      // if not defined set default url
      if(photoURL == undefined || photoURL == "undefined") photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";

      console.log("userInfo: ",userInfo[journalUserID])
      console.log("firstName: ",firstName)
      console.log("photoURL: ",photoURL)
      console.log("notificationID: ",notificationID)
      console.log("-------------------------")

      admin.database().ref('pldpNotifications/'+notificationID+"/photoURL").set(photoURL);
      
  }).catch(err => {
      console.log('Tokens Error: ', err);
  })
  
});
   