const functions = require('firebase-functions');
const admin = require('firebase-admin');

var handleNotifications = require('./handle-notifications');
var userToken = new handleNotifications();

exports.newFeedback = functions.database.ref('/feedback/{feedbackID}').onCreate((snap, context) => {
  // Get Firebase object
  const feedbackobj = snap.val();
  const feedbackobjid = snap.key;

  var message = feedbackobj.message;
  var subject = feedbackobj.subject;
  var category = feedbackobj.category;
  var senderName = feedbackobj.journalUserName;
  var senderEmail = feedbackobj.journalUserEmail;
  var userPlatform = feedbackobj.userPlatform;
  var companyID = feedbackobj.companyID;

  if (category == undefined) {
    category = "Feedback";
  }

  if (userPlatform == undefined) {
    userPlatform = " N/A ";
  }

  if (message !== undefined && message.length > 2) {

    let msg = '<b>Dear Leadership Platform,</b><br><br>';
    msg += 'Category: ' + category + '<br><br>';
    msg += 'Subject: ' + subject + '<br><br>';
    msg += 'Message: ' + message + '<br><br>';
    msg += 'From: ' + senderName + ' <br>';
    msg += 'Email: ' + senderEmail + '<br>';
    msg += '<br>';
    msg += '<b>Best Regards,</b> <br>';
    msg += '<b>Global Leadership Platform.</b><br>';
    msg += '<br><br>';
    msg += '<i>User Platform: ' + userPlatform + '</i><br>';

    let msgPlain = 'Dear Leadership Platform,';
    msgPlain += 'Category: ' + category + '<br><br>';
    msgPlain += 'Subject: ' + subject + '';
    msgPlain += 'Message: ' + message + '';
    msgPlain += 'From: ' + senderName + '';
    msgPlain += 'Email: ' + senderEmail + '';
    msgPlain += '';
    msgPlain += 'Best Regards,';
    msgPlain += 'Global Leadership Platform.';
    msgPlain += '';
    msgPlain += '';
    msgPlain += 'User Platform: ' + userPlatform + '<br>';

    var subject = '[' + category + ' - Global Leadership Platform] : ' + subject;

    // if EDCON copy Khanyisa
    if (companyID == "-LOs4iZh3Y9LSiNtpWlH") {
      // Send to Khanyisa
      var to = 'support@thinklead.co.za, KMhlaba@edcon.co.za';
    } else {
      // Send to LDP
      var to = 'support@thinklead.co.za, info@leadershipplatform.com';
    }


    // live server options
    var options = {
      "to": to,
      "bcc": 'colman@oneconnect.co.za',
      "subject": subject,
      "msgTxt": msgPlain,
      "msgHTML": msg
    }
  
    let emailRes = userToken.sendNewUserEmail(options);
  }

  return true;
});