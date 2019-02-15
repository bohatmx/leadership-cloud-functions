const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on delete pldp tasks
exports.pldpTasksDeleted = functions.database.ref('/pldp-tasks/{userID}/{taskID}').onDelete((snap, context) => {
  // Get Firebase object
  const deletedItem = snap.val();

  var companyID = deletedItem.companyID;
  var moveAction = deletedItem.moveAction;

  // Subtract count to values analytics for company
  let countItems = admin.database().ref('company-values').child(companyID).child(moveAction).child('count');

  let countItem = countItems.transaction(function (current) {
    if ((current == 0) || (current == undefined)) {
      return current
    } else {
      return (current || 0) - 1;
    }
  });
  
});