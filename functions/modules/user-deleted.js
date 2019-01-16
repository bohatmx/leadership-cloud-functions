const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on delete users
exports.usersDeleted = functions.database.ref('/users/{userID}').onDelete((snap, context) => {
    // Get Firebase object
    const deletedItem = snap.val();
    var userID = context.params.userID;
    var uid = deletedItem.uid;
  
    // assign user data
    var userData = deletedItem;
  
    // create new key
    // var writeOperationsID = admin.database().ref().child('writeOperations/deleteUserElastic').push().key;
    // userData.writeOperationsID = writeOperationsID;
  
    // update writeOperations data
    var updates = {};
    // updates['writeOperations/deleteUserElastic/'+writeOperationsID+'/userData'] = userData;
    updates['deletelogs/users/'+userID] = userData;
  
    admin.database().ref().update(updates).then(postsupdate => {
        console.log('Deleted user Elastic search record posted');
    }).catch(posts_err => {
        console.log('Error posting deleted user Elastic search');
    })

    // Delete from User Authentication
    if(uid){
        admin.auth().deleteUser(uid)
        .then(function() {
            console.log("Successfully deleted user");
        })
        .catch(function(error) {
            console.log("Error deleting user:", error);
        });
    }

  });