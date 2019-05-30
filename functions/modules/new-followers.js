const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create or update daily thoughts
exports.newFollowers = functions.database.ref('/followers/{key}/{userID}').onCreate((snap, context) => {
  const followerObj = snap.val();
  const followerKey = snap.key;
  const userID = context.params.userID;
  const key = context.params.key;
  var snapRef = snap.ref;

  console.log("follower key: ", key);

  if(userID == key){
    return snapRef.remove()
  }

  return admin.database().ref('/users/' + userID).once('value').then(function(snapshot) {
  
    console.log("userID: "+userID);
    console.log("user sanpshot: "+snapshot.val());

    var email = (snapshot.val() && snapshot.val().email) || '';
    var companyID = (snapshot.val() && snapshot.val().companyID) || '';
    var receiveEmails = (snapshot.val() && snapshot.val().receiveEmails);

    if(receiveEmails == undefined || receiveEmails == '') {receiveEmails = true}

    console.log("receiveEmails: ",receiveEmails);

    if(email != undefined || email != ''){
      
      if(email.length == 0){
        snapRef.remove();
        return snapshot;
      }

      var updates = {
        email: email,
        companyID: companyID
      }

      if(receiveEmails == true){
        console.log("receiveEmails true update: ",receiveEmails);
        return snap.ref.update(updates);
      }else{
        console.log("receiveEmails false delete: ",receiveEmails);
        return snap.ref.remove();
      }

      // return snap.ref.child('email').set(email);
    }
    
    return snapshot;
  });

});
   