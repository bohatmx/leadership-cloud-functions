
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config.js');
var url = config.url;

exports.userCreated = functions.database.ref('/users/{userID}').onCreate((snap, context) => {
    var user = snap.val();
    const userID = snap.key;

    var TinyURL = require('tinyurl');
    var dbUserRef = admin.database().ref('/users');
    var userRef = admin.database().ref('/user');
    var uid = user.uid;
  
    if(userID != undefined){
        userRef.child(uid).set(user, function(error) {
            if (error) {
              // The write failed...
              console.log("Error setting new user at server.");
            } else {
              // Data saved successfully!
              console.log("New user added successfully.")
            }
        });

        var userURL = url+"#/lead/"+userID+"/sign-up";

        TinyURL.shorten(userURL, function(res) {
            dbUserRef.child(userID).child("userURL").set(res, function(error) {
                if (error) {
                  // The write failed...
                  console.log("Error setting new userURL 1.");
                } else {
                  // Data saved successfully!
                  console.log("New userURL 1 added successfully.")
                }
            });

            userRef.child(uid).child("userURL").set(res, function(error) {
                if (error) {
                  // The write failed...
                  console.log("Error setting new userURL 2.");
                } else {
                  // Data saved successfully!
                  console.log("New userURL 2 added successfully.")
                }
            });

        });
    }
  
  });