const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config.js");
var handleNotifications = require("./handle-notifications");
var userWelcomeEmail = require("./welcome-email");
var url = config.url[config.environment];

var userToken = new handleNotifications();
var welcomeEmail = new userWelcomeEmail();

exports.resendWelcome = functions.database
  .ref("/resend-welcomemail/{userID}")
  .onCreate((snap, context) => {
    var user = snap.val();
    var email = user.email;
    var companyID = user.companyID;

    var url = userToken.getCompanyURL(companyID);

    var msgPlain = "",
      msg = "";

    // construct emails - plain and html templates
    msgPlain = welcomeEmail.plainEmail(user, url);
    msg = welcomeEmail.htmlEmail(user, url);

    var to = email;
    var subject = "Welcome to Global Leadership Platform";

    // Send Email Notification
    var options = {
      to: to,
      bcc: "colman@oneconnect.co.za",
      subject: subject,
      msgTxt: msgPlain,
      msgHTML: msg
    };

    var sentEmail = userToken.sendNewUserEmail(options);

    return snap.ref.remove();
  });
