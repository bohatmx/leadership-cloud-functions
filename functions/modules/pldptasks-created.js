const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create pldp tasks
exports.pldpTasksCreated = functions.database.ref('/pldp-tasks/{userID}/{taskID}').onCreate((snap, context) => {
    // Get Firebase object
    const deletedItem = snap.val();
  
    var companyID = deletedItem.companyID;
    var moveAction = deletedItem.moveAction;
  
    // Add count to values analytics for company
    let countItems = admin.database().ref('company-values').child(companyID).child(moveAction).child('count');
  
    let countItem = countItems.transaction(function (current) {
      return (current || 0) + 1;
    });
    
});