const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create or update daily thoughts
exports.removeBadAccounts = functions.https.onRequest((req, res) => {
 
  return admin.database().ref('/followers').once('value').then(function(snapshot) {
      var key = snapshot.key;
      var val = snapshot.val();

      snapshot.forEach(function(childSnapshot) {

        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        // console.log("child key: ", childKey);

        childSnapshot.forEach(function(childSnapshot1){
            var childref = childSnapshot1.ref;
            var email = childSnapshot1.val().email;
            var firstname = childSnapshot1.val().firstName;
            if(email.length == 0){
                console.log("email: ",email, "len: ", email.length, " firstname: "+firstname);
                // childref.remove();
            }
            
        })

        

        // var notification_key = childData.notification_key;

        // if(notification_key == undefined){
        //   console.log("undefined key for user: ", user.key)
        // }else{
        //   var msg = {
        //     "notification_key": notification_key,
        //     payload: payload
        //   }
        //   userToken.send(msg);
        // }

      });
    // var email = (snapshot.val() && snapshot.val().email) || '';

    // if(email != undefined || email != ''){
    //   return snap.ref.child('email').set(email);
    // }
    
    return snapshot;
  });

});