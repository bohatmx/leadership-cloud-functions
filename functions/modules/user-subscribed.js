const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create or update daily thoughts
exports.userSubscribed = functions.database.ref('/subscribed/{userID}').onCreate((snap, context) => {
    var key = snap.key;
    var val = snap.val();
    
    var subscribeduser = admin.database().ref('users').orderByChild('userID').equalTo(key)
        .once('value').then(function (snapshot) {            
            snapshot.forEach(function(childSnapshot) {

                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                var following = childData.following;
                var updates = {};

                if(following != undefined){
                    var photoURL = "";
        
                    if(childData.photoURL != undefined || childData.photoURL != ""){
                        photoURL = childData.photoURL;
                    }else{
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
                
                    if(photoURL == undefined || photoURL == ""){
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }

                    var subscriber = {
                        userID:childData.userID,
                        companyID:childData.companyID,
                        companyName:childData.companyName,
                        firstName:childData.firstName,
                        lastName:childData.lastName,
                        email:childData.email,
                        dateRegistered:Date.now(),
                        photoURL:photoURL
                    }

                    for (var x in following) {
                        console.log("subscribe to: ", x);
                        updates["followers/"+x+"/"+childKey]=subscriber;
                    }
    
                    updates["unsubscribed/"+childKey]=null;
    
                    var usersubscribed = admin.database().ref().update(updates).then(() =>{
                        return console.log("Subscribed: ",key);
                    }); 
                }
                
            });

            return snapshot;
        });

    return true;
});
   