//-------
// bulk user file upload 
//-------
// parse file create json
//-------
// validate file data
// validate column headings
// validate email string
// validate empty cells
// build report
//-------
// create user
// passed
// build report 
// failed
// build report 
//-------
// email report
const functions = require("firebase-functions");
const admin = require("firebase-admin");
var userID = "";
var userObj = {};

var log = [];

init = function() {
  log.push("Log of users created.");
}

//-------
emailReport = function() {
  updates["log-emailuserscreated/" + uid] = log.join("<br/>").toString();
}

//-------
createUser = function() {
  //create firebase auth user
  createFirebaseAuthUser();

  //create firebase users
  insertFirebaseUserTable();

  //create firebase user
  insertFirebaseUsersTable();

  //create user to follow global leader
  followFirebaseGlobalContributor();
}

createFirebaseAuthUser = function() {
  userID = admin
    .database()
    .ref()
    .child("users")
    .push().key;

  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: displayName,
      disabled: false
    }).then(function(user) {
      user.uid;
    })
}


initUserData = function(userObj) {
  userObj = {
    companyID: userObj.companyID,
    companyName: userObj.companyName,
    dateRegistered: userObj.dateRegistered,
    email: userObj.email,
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    password: userObj.password,
    stringDateRegistered: userObj.stringDateRegistered,
    userDescription: userObj.userDescription,
    uid: null,
    userID: userObj.userID,
    userType: userObj.userType,
    inviteSent: true,
    companyID_userType: userObj.companyID + "_" + userObj.userType
  };
}

customUserData = function(params) {
  //
  switch (params) {
    case "-LOs4iZh3Y9LSiNtpWlH":
      userObj.ce_id = "WXiLeBhQwqT6YpVEyBuRI28nIG82";
      userObj.ceo_id = "WXiLeBhQwqT6YpVEyBuRI28nIG82";
      break;
  }
}

//-------
parseFile = function() {

}

//-------
validateCell = function(column, cell) {
  // validate empty cells
  if (cell === "") {
    buildReport("No value passed for", column);
  }
}

//-------
validateColumns = function(params) {
  // validate column headings Firstname, Lastname, User Type, Email
  if (!['Firstname', 'Lastname', 'User Type', 'Email'].includes(col)) {
    buildReport("Failed unexpected column", params);
  }
}

//-------
validateEmail = function(params) {
  // validate email string
  if (!params.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    buildReport("Failed email validation for", params);
  }
}

//-------
buildReport = function(message, value) {
  log.push("- " + message + ": " + value);
}