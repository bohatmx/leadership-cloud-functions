const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.updateFollowers = functions.https.onRequest((req, res) => {
   
    return admin.database().ref('/users').once('value').then(function(snapshot) {
        
        snapshot.forEach(function(childSnapshot) {

            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var followers = childData.follower;

            if(followers != undefined){
                // var followerkey = followers.key;
                // console.log("follower key: ", followerkey)
                admin.database().ref('/followers/'+childKey).set(followers)
            }

            // console.log("child key: ", childKey);
            // console.log("child followers: ", followers);
            // console.log("child data: ", childData);
        });

        return snapshot;
    });
    
});