const functions = require('firebase-functions');
var appAnalytics = require('./app-analytics');
var updateAppAnalytics = new appAnalytics();

// on create or update daily thoughts
exports.userLikes = functions.database.ref('/user-liked/{userPost}').onCreate((snap, context) => {
    const likeObj = snap.val();

    updateAppAnalytics.addlikes(likeObj);

    return true;
});
   