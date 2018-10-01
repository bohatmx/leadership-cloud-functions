const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create or update daily thoughts
exports.userUnsubscribed = functions.database.ref('/unsubscribed/{userID}').onCreate((snap, context) => {
    var key = snap.key;
    var val = snap.val(); 
    
    var unsubscribeuser = admin.database().ref('users').orderByChild('userID').equalTo(key)
        .once('value').then(function (snapshot) {            
            snapshot.forEach(function(childSnapshot) {

                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                var following = childData.following;
                var uid = childData.uid;
                var updates = {}

                if(following != undefined){
                    for (var x in following) {
                        console.log("unsubscribe from: ", x);
                        updates["followers/"+x+"/"+childKey]=null;
                    }

                    updates["users/"+childKey+"/receiveEmails"]=false;
                    updates["user/"+uid+"/receiveEmails"]=false;
    
                    var userunsubscribed = admin.database().ref().update(updates).then(() =>{
                        return console.log("Unsubscribed: ",key);
                    });
                }          
                
            });

            return snapshot;
        });

    return true;
});
   