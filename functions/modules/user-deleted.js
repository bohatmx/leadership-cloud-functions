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

    var companyID = deletedItem.companyID;
    
    // Add count to users analytics for users
    let countItems = admin.database().ref('company-analytics').child(companyID).child('counts').child('noofusers');

    let countItem = countItems.transaction(function (current) {
        if (current == 0) {
        return current
        } else {
        return (current || 0) - 1;
        }
    });
  
    // update writeOperations data
    var updates = {};
    updates['deletelogs/users/'+userID] = userData;
  
    admin.database().ref().update(updates).then(postsupdate => {
        console.log('Deleted user - log updated ');
    }).catch(posts_err => {
        console.log('Error logging deleted user');
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