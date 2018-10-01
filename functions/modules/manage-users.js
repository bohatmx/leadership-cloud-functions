const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config.js');
var url = config.url;

module.exports = function (){
    this.updateAllUsers = function(){
        var users = admin.database().ref('/users').once('value');
        users.then(snapshot =>{
            snapshot.forEach(function(childSnapshot) {

                var childData = childSnapshot.val();
                var childKey = childSnapshot.key;
                var photoURL = "";

                if(childData.photoURL != undefined || childData.photoURL != ""){
                    photoURL = childData.photoURL;
                }else{
                    photoURL = "";
                }

                if(photoURL == "undefined") photoURL = "";
                if(photoURL == undefined) photoURL = "";

                var userType = childData.userType;
                if(userType == undefined) userType = 3;

                var userDescription = childData.userDescription;
                if(userDescription == undefined) userDescription = "I-Leader";

                var userURL = childData.userURL;
                if(userURL == undefined) userURL = "";

                var TinyURL = require('tinyurl');

                if(childData.companyID != undefined){
                    var data = {
                        "companyID" : childData.companyID,
                        "companyName" : childData.companyName,
                        "dateRegistered" : childData.dateRegistered,
                        "email" : childData.email,
                        "firstName" : childData.firstName,
                        "lastName" : childData.lastName,
                        "stringDateRegistered" : childData.stringDateRegistered,
                        "userDescription" : userDescription,
                        "userType" : userType,
                        "companyID_userType" : childData.companyID+"_"+userType,
                        "photoURL" : photoURL,
                        "userID" : childData.userID,
                        "userURL" : userURL
                    }
        
                    admin.database().ref('/user/'+childData.uid).set(data);
                    var userRef = admin.database().ref('/user/'+childData.uid);

                    if(userURL == ""){
                        userURL = url+"#/lead/"+childData.userID+"/sign-up";

                        TinyURL.shorten(userURL, function(res) {
                            userRef.child("userURL").set(res, function(error) {
                                if (error) {
                                  // The write failed...
                                  console.log("Error setting new userURL 1.");
                                } else {
                                  // Data saved successfully!
                                  console.log("New userURL 1 added successfully.")
                                }
                            });
                        });
                    }

                    
                }

            });

        });
        
    }

}