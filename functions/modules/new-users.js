const functions = require('firebase-functions');
const admin = require('firebase-admin');

var handleNotifications = require('./handle-notifications');
var userToken = new handleNotifications();
var userWelcomeEmail = require('./welcome-email');
const config = require('./config.js');
var welcomeEmail = new userWelcomeEmail();

exports.newUsers = functions.database.ref('/newUploadUsers/{newUploadUserID}').onCreate((snap, context) => {
  // Get Firebase object
  const userobj = snap.val();
  const userobjid = snap.key;

  if ((userobj != undefined) || (userobj != null)) {
    if (userobj.email != undefined) {
      var email = userobj.email;
    }
  }

  if (email !== undefined && email.length > 5) {
    var userID = admin.database().ref().child('users').push().key;
    var password = userobj.password;
    var displayName = userobj.firstName + " " + userobj.lastName;
    var lastName = userobj.lastName;
    var firstName = userobj.firstName;
    let companyID = userobj.companyID;
    let companyName = userobj.companyName;
    // get date and time
    var dateRegistered = userobj.dateRegistered;
    var stringDateRegistered = userobj.stringDateRegistered;
    let userType = userobj.userType;
    let userDescription = userobj.userDescription;

    var url = userToken.getCompanyURL(companyID);

    var msgPlain = "", msg = "";

    // construct emails - plain and html templates
    msgPlain = welcomeEmail.plainEmail(userobj, url);
    msg = welcomeEmail.htmlEmail(userobj, url);

    return admin.auth().createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: displayName,
      disabled: false
    }).then(function (user) {
      var uid = user.uid;

      var data = {
        "companyID": companyID,
        "companyName": companyName,
        "dateRegistered": dateRegistered,
        "email": email,
        "firstName": firstName,
        "lastName": lastName,
        "password": password,
        "stringDateRegistered": stringDateRegistered,
        "userDescription": userDescription,
        "uid": uid,
        "userID": userID,
        "userType": userType,
        "inviteSent": true,
        "companyID_userType": companyID + "_" + userType
      }

      // if EDCON set CE ID
      if(companyID == "-LOs4iZh3Y9LSiNtpWlH"){
        // set Grant by default
        data.ce_id = "WXiLeBhQwqT6YpVEyBuRI28nIG82";
        data.ceo_id = "WXiLeBhQwqT6YpVEyBuRI28nIG82";
        // data.ce_id = userobj.ce_id;
        // data.ceo_id = userobj.ceo_id;
      }

      // Write the new user data, followGC, user, resend mail
      var updates = {};
      updates['users/' + userID] = data;
      updates['followGC/' + uid] = data;
      updates['user/' + uid] = data;
      
      // Send mail from Live server only
      if(config.environment === 1){
        updates['resend-welcomemail/' + uid] = data;
      }

      // update new user record
      admin.database().ref().update(updates);

      console.log("user created successfully: ",email)

      // delete user snapshot
      return snap.ref.remove();

    }, function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.error("error createing new user: ",errorMessage)
    });

  }
});
