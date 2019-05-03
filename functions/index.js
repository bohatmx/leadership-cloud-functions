const functions = require("firebase-functions");
const admin = require("firebase-admin");
// admin.initializeApp();

// Test Server
// var serviceAccount = require("./service/glp-test-firebase-adminsdk-58xlx-84586619f2.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://glp-test.firebaseio.com"
// });

// Live Server
var serviceAccount = require("./service/leadershipplatform-158316-firebase-adminsdk-goitz-f99dd5b92d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://leadershipplatform-158316.firebaseio.com"
});

const config = require("./modules/config.js");

const commentsIn = require("./modules/comments-in");
var updateUserURL = require("./modules/update-userurl");
var tokenRefresh = require("./modules/token-refresh");
var newReminderIn = require("./modules/reminders-in");
var newFollowers = require("./modules/new-followers");
var updateFollowers = require("./modules/update-followers");
var testMails = require("./modules/test-mails");
var updateAnalytics = require("./modules/update-analytics");
var commentsDeleted = require("./modules/comments-deleted");
var likesDeleted = require("./modules/likes-deleted");
var userLikes = require("./modules/user-likes");
var userClicks = require("./modules/user-clicks");
var unsubscribeUsers = require("./modules/unsubscribe-users");
var userSubscribed = require("./modules/user-subscribed");
var userUnsubscribed = require("./modules/user-unsubscribed");
var appNotifications = require("./modules/app-notifications");
var analyticsNotifications = require("./modules/analytics-notifications");
var mailNotifications = require("./modules/mail-notifications");
var followGC = require("./modules/follow-gc");
var removeUser = require("./modules/remove-user");
var unshortenURL = require("./modules/unshorten-url");
var writeOperations = require("./modules/write-operations");
var usersDeleted = require("./modules/user-deleted");
var resendWelcome = require("./modules/resend-welcomemail");
var resetPassword = require("./modules/reset-password");

// Create modules for all functions within indexjs
var newThoughts = require("./modules/new-thoughts");
var deletedThoughts = require("./modules/deleted-thoughts");
var newArticles = require("./modules/new-articles");
var deletedArticles = require("./modules/deleted-articles");
var newPodcasts = require("./modules/new-podcasts");
var deletedPodcasts = require("./modules/deleted-podcasts");
var newVideos = require("./modules/new-videos");
var deletedVideos = require("./modules/deleted-videos");
var newFeedback = require("./modules/new-feedback");
var newUsers = require("./modules/new-users");
var userCreated = require("./modules/user-created");
var pldpTasksCreated = require("./modules/pldptasks-created");
var pldpTasksDeleted = require("./modules/pldptasks-deleted");
var publishContent = require("./modules/publish-content");
var sendUserReminders = require("./modules/pldp-reminders");

var onImageUploaded = require("./modules/image-uploaded");

// ----------------- API MODULE -------------------- //
var app = require("./api/api-app");

// ---------------- GRAPHQL MODULE ----------------- //

exports.m01 = commentsIn;
exports.m02 = updateUserURL;
exports.m03 = tokenRefresh;
exports.m04 = newReminderIn;
exports.m05 = newFollowers;
exports.m06 = updateFollowers;
exports.m07 = testMails;
exports.m08 = updateAnalytics;
exports.m09 = commentsDeleted;
exports.m10 = likesDeleted;
exports.m11 = userLikes;
exports.m12 = userClicks;
exports.m13 = unsubscribeUsers;
exports.m14 = userSubscribed;
exports.m15 = userUnsubscribed;
exports.m16 = appNotifications;
exports.m17 = analyticsNotifications;
exports.m18 = mailNotifications;
exports.m19 = followGC;
exports.m20 = removeUser;
exports.m21 = unshortenURL;
exports.m22 = writeOperations;
exports.m23 = usersDeleted;
exports.m24 = resendWelcome;
exports.m25 = resetPassword;
exports.m26 = newThoughts;
exports.m27 = deletedThoughts;
exports.m28 = newArticles;
exports.m29 = deletedArticles;
exports.m30 = newPodcasts;
exports.m31 = deletedPodcasts;
exports.m32 = newVideos;
exports.m33 = deletedVideos;
exports.m34 = newFeedback;
exports.m35 = newUsers;
exports.m36 = userCreated;
exports.m37 = pldpTasksCreated;
exports.m38 = pldpTasksDeleted;
exports.m39 = publishContent;
exports.m40 = sendUserReminders;
exports.m41 = onImageUploaded;

//
exports.api = functions.https.onRequest(app);
