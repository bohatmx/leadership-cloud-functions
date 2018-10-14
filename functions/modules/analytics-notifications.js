const functions = require('firebase-functions');
var appAnalytics = require('./app-analytics');
var updateAppAnalytics = new appAnalytics();

// on create or update daily thoughts
exports.analyticsNotifications = functions.database.ref('/analyticsNotifications/{analyticsNotificationID}').onCreate((snap, context) => {
    const analyticsID = snap.key;
    const analyticsObj = snap.val();

    var notificationData = analyticsObj.notificationData;
    var all = analyticsObj.all;

    var postaddres = updateAppAnalytics.addposts(notificationData);

    console.log(all)
    console.log(notificationData)

    return snap.ref.remove();
});
   