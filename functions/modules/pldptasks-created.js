const functions = require("firebase-functions");
const admin = require("firebase-admin");

// on create pldp tasks
exports.pldpTasksCreated = functions.database
  .ref("/pldp-tasks/{userID}/{taskID}")
  .onCreate((snap, context) => {
    // Get Firebase object
    const createdItem = snap.val();

    var companyID = createdItem.companyID;
    var moveAction = createdItem.moveAction;

    // Add count to values analytics for company
    if (companyID == undefined || companyID == null) {
      console.log("Undefined companyID: ", reminderObj);
      return false;
    }

    let countItems = admin
      .database()
      .ref("company-values")
      .child(companyID)
      .child(moveAction)
      .child("count");

    let countItem = countItems.transaction(function(current) {
      return (current || 0) + 1;
    });
  });
