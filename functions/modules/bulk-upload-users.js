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
var log = [];

exports.bulkUploadUsers = functions.database
  .ref("/bulkUploadUsers")
  .onCreate((snap, context) => {
    console.log('received data', snap.val());
    // init(snap.val());
    // return snap.ref.remove();
  });

//-------
initUserData = function(params, uid) {
  return {
    companyID: params.companyID,
    companyName: params.companyName,
    dateRegistered: params.dateRegistered,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    password: params.password,
    stringDateRegistered: params.stringDateRegistered,
    userDescription: params.userDescription,
    uid: uid,
    userID: params.userID,
    userType: params.userType,
    inviteSent: true,
    companyID_userType: params.companyID + "_" + params.userType
  };
}

//-------
init = function(file) {
  log.push("Log of users created.");
  parseFile(file);
}

//-------
parseFile = function(file) {
  for (let user in file) {
    createFirebaseUserKey();
    createFirebaseAuthUser(user);
  }
}

//-------
createFirebaseUserKey = function() {
  userID = admin
    .database()
    .ref()
    .child("users")
    .push().key;
}

//-------
createFirebaseAuthUser = function(params) {
  admin
    .auth()
    .createUser({
      email: params.email,
      emailVerified: false,
      password: params.password,
      displayName: params.displayName,
      disabled: false
    }).then(function(result) {
      let user = initUserData(result, user.uid);
      createUser(user);
      buildReport("Success user created", userObj.firstName + " " + userObj.lastName);
    }, function(error) {
      buildReport("Error creating user", error.code + " - " + error.message);
    });
}

//-------
createUser = function(userObj) {
  var updates = {};

  //validate user email and cell value
  validateUser(userObj);

  //create firebase users
  insertFirebaseUserTable(updates, userObj);

  //create firebase user
  insertFirebaseUsersTable(updates, userObj);

  //create user to follow global leader
  followFirebaseGlobalContributor(updates, userObj);

  //culminate all updates and publish
  updateFirebaseDatabase(updates)

  //send welcom email
  sendEmail(userObj);

  //send email report to author of bulk upload
  emailReport();
}

//-------
followFirebaseGlobalContributor = function(updates, params) {
  updates["followGC/" + params.uid] = params.data;
}

//-------
insertFirebaseUsersTable = function(updates, params) {
  updates["users/" + userID] = params.data;
}

//-------
insertFirebaseUserTable = function(updates, params) {
  updates["user/" + params.uid] = params;
}

//-------
updateFirebaseDatabase = function(updates) {
  admin
    .database()
    .ref()
    .update(updates);
}

//-------
customUserData = function(params) {
  //For EDCON assign the following values
  switch (params) {
    case "-LOs4iZh3Y9LSiNtpWlH":
      userObj.ce_id = "WXiLeBhQwqT6YpVEyBuRI28nIG82";
      userObj.ceo_id = "WXiLeBhQwqT6YpVEyBuRI28nIG82";
      break;
  }
}

//-------
validateUser = function(params) {
  validateCell(params);
  validateColumns(params);
  validateEmail(params);
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

//-------
sendEmail = function(params) {
  if (config.environment === 1) {
    updates["resend-welcomemail/" + params.uid] = params;
  } else {
    updates["resend-welcomemail/" + params.uid] = params;
  }
}

//-------
emailReport = function() {
  updates["log-emailuserscreated/" + uid] = log.join("<br/>").toString();
}