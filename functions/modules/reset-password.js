
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.resetPassword = functions.database.ref('/reset-password/{uid}').onCreate((snap, context) => {
    var user = snap.val();

    var password = user.password;
    var uid = user.uid;

    admin.auth().updateUser(uid, {
        emailVerified: true,
        password: password
    }).then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully updated user", userRecord.toJSON());
    }).catch(function(error) {
        console.log("Error updating user:", error.message);
    });

    return snap.ref.remove();
  });