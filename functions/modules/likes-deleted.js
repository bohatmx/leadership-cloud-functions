const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on delete daily thoughts
exports.deletedThoughts = functions.database.ref('/user-likes/{userPost}').onDelete((snap, context) => {
    // Get Firebase object
    const deletedItem = snap.val();
    var journalUserID = deletedItem.journalUserID;
    var companyID = deletedItem.companyID;

    let countCompany = admin.database().ref('company-analytics').child(companyID).child('counts').child('likes');

    let companyCount = countCompany.transaction(function(current) {
        if ((current == 0) || (current == undefined)) {
            return current
        } else {
            return (current || 0) - 1;
        }
    });

    let countUser = admin.database().ref('users-analytics').child(companyID).child(journalUserID).child('counts').child('likes');

    let userCount = countUser.transaction(function(current) {
        if ((current == 0) || (current == undefined)) {
            return current
        } else {
            return (current || 0) - 1;
        }
    });
    
});