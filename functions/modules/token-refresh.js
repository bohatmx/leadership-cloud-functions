const functions = require('firebase-functions');
const admin = require('firebase-admin');
var handleNotifications = require('../modules/handle-notifications');
var userToken = new handleNotifications();

exports.userTokenRefresh = admin.database().ref('data-modelling/userWriteable/tokenRefresh').on('child_added', function(snap) {
    var tokenRef = snap.ref;
    var tokenSnap = snap.val();

    var users = admin.database().ref('/user/'+tokenSnap.uid).once('value');
    users.then(snapshot =>{
        snapshot.forEach(function(childSnapshot) {
            
            var childData = childSnapshot.val();
            var childKey = childSnapshot.key;

            var notification_key = childData.notification_key;

            // If it's null or undefined - create a notification key for the user else, remove and add new key
            if(notification_key == undefined || notification_key == null){
                // Create - new currentToken
                var tokens = [];
                tokens.push(tokenSnap.currentToken);
                var device = {
                    "uid": tokenSnap.uid
                };

                device.reg_ids = tokens;
                userToken.create(device);

                tokenRef.remove();

            }else{
                // Remove - previousToken first
                var prevtokens = [];
                prevtokens.push(tokenSnap.previousToken);
                var prevdevice = {
                    "uid": tokenSnap.uid,
                    "notification_key": childData.notification_key
                };
                prevdevice.reg_ids = prevtokens;
                userToken.remove(prevdevice);

                // Add - new currentToken first
                var tokens = [];
                tokens.push(tokenSnap.currentToken);
                var device = {
                    "uid": tokenSnap.uid,
                    "notification_key": childData.notification_key
                };
                device.reg_ids = tokens;
                userToken.add(device);

                tokenRef.remove();

            }
            
        });

    });
});