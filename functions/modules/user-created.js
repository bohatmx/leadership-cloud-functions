const functions = require('firebase-functions');
const admin = require('firebase-admin');

// New user account created
exports.userCreated = functions.database.ref('/user/{userID}').onCreate((snap, context) => {
  // Get Firebase object
  const user = snap.val();

  if (user) {
    // Specify Algolia's objectID using the Firebase object key
    var companyID = user.companyID;

    if (companyID != undefined) {
      // Add count to users analytics for users
      let countItems = admin.database().ref('company-analytics').child(companyID).child('counts').child('noofusers');
      let currentCount = countItems.transaction(function (current) {
        return (current || 0) + 1;
      });

    }
  }
});