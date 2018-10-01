const functions = require('firebase-functions');
var appAnalytics = require('./app-analytics');
var updateAppAnalytics = new appAnalytics();

// on create or update daily thoughts
exports.userClicks = functions.database.ref('/user-clicks/{dateRegistered}').onCreate((snap, context) => {
    const clickObj = snap.val();

    updateAppAnalytics.addclicks(clickObj);
});
   