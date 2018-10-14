const functions = require('firebase-functions');
const admin = require('firebase-admin');

// on create or update daily thoughts
exports.appNotifications = functions.database.ref('/appNotifications/{appNotificationID}').onCreate((snap, context) => {
    const appID = snap.key;
    const appObj = snap.val();
    var all = appObj.all;
    var postcompanyID = appObj.companyID;
    var notificationData = appObj;

    console.log(all)
    console.log(appObj)

    var getfollowers = admin.database().ref('/followers/'+appObj.journalUserID).once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var companyID = childData.companyID;

            if(all == true){
                console.log("notify to all");
                console.log("Subscribed, push to app notification ", childKey);

                var newNotificationID = admin.database().ref().child('users/'+childKey+'/notifications').push().key;
                notificationData.newNotificationID = newNotificationID;
                // Write the new notification's data
                var updates = {};
                updates['users/'+childKey+'/notifications/'+newNotificationID] = notificationData;
                admin.database().ref().update(updates).then(postsupdate => {
                    console.log('thoughts notification published');
                }).catch(posts_err => {
                    console.log('posts notification error');
                })
                
            }else{
                if(companyID == postcompanyID){
                    console.log("notify to company");
                    console.log("Subscribed, push app notification ", childKey);

                    var newNotificationID = admin.database().ref().child('users/'+childKey+'/notifications').push().key;
                    notificationData.newNotificationID = newNotificationID;
                    // Write the new notification's data
                    var updates = {};
                    updates['users/'+childKey+'/notifications/'+newNotificationID] = notificationData;
                    admin.database().ref().update(updates).then(postsupdate => {
                        console.log('posts notification published');
                    }).catch(posts_err => {
                        console.log('posts notification error');
                    })
                    
                }
            }

        });
    });

    return snap.ref.remove();
});
   