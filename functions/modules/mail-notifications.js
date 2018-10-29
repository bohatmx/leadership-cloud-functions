const functions = require('firebase-functions');
var handleNotifications = require('./handle-notifications');
var userToken = new handleNotifications();

// on create or update daily thoughts
exports.mailNotifications = functions.database.ref('/mailNotifications/{mailNotificationID}').onCreate((snap, context) => {
    const mailID = snap.key;
    const mailObj = snap.val();

    var options = mailObj.options;
    var all = mailObj.all;

    console.log(all)
    console.log(options)

    var mailres = userToken.sendBatchMails(options);

    return snap.ref.remove();
});
   