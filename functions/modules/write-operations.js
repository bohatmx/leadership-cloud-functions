const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const newElasticSearch = require('./elasticsearch');

// const elasticsearch = new newElasticSearch();

// on write operation request
exports.writeOperations = functions.database
  .ref("/writeOperations/{writeCategory}/{writeOperationsID}")
  .onCreate((snap, context) => {
    // New user record to be indexed
    if (context.params.writeCategory === "newUserElastic") {
      const writeOperationsObj = snap.val();
      var userData = writeOperationsObj.userData;

      // var userAction = elasticsearch.userCreated(userData);
    }

    // Delete user record from Elastic Search
    if (context.params.writeCategory === "deleteUserElastic") {
      const writeOperationsObj = snap.val();
      var userData = writeOperationsObj.userData;

      // var userAction = elasticsearch.userDeleted(userData);
    }

    // Disable / Update user record from Elastic Search
    if (context.params.writeCategory === "disableUserElastic") {
      const writeOperationsObj = snap.val();
      var uid = writeOperationsObj.uid;

      // Disable User Authentication
      if (uid) {
        admin
          .auth()
          .updateUser(uid, {
            disabled: true
          })
          .then(function(userRecord) {
            // Update Elastic search record
            // var userAction = elasticsearch.userUpdated(uid);
            console.log("Successfully disabled user: ", userRecord);
          })
          .catch(function(error) {
            console.log("Error disabling user:", error);
          });
      }
    }

    // Update user record from Elastic Search
    if (context.params.writeCategory === "updateUserElastic") {
      const writeOperationsObj = snap.val();
      var uid = writeOperationsObj.uid;

      // Disable User Authentication
      if (uid) {
        // Update elastic search record
        // var userAction = elasticsearch.userUpdated(uid);
      }
    }

    // Update user record from Elastic Search
    if (context.params.writeCategory === "searchUserElastic") {
      const writeOperationsObj = snap.val();

      // Update elastic search record
      // var userAction = elasticsearch.userSearch(writeOperationsObj);
    }

    return snap.ref.remove();
  });
