const functions = require('firebase-functions');
const admin = require('firebase-admin');
var async = require("async");

// on create or update daily thoughts
exports.removeUser = functions.https.onRequest((req, res) => {
    
    var listofnewemails = ["bant@mail.com","bob@delan.co.za","bouncetest@tribulant.com","demo@afriforum.co.za","demo@blsa.org.za","demo@edcon.co.za","demo@flysaa.com","demo@harmony.co.za","demo@hugegroup.com","demo@mcd.co.za","demo@mediclinic.co.za","demo@miway.co.za","demo@sandvik.co.za","demo@spar.co.za","demo@telesure.co.za","demo@thomsonreuters.com","idpdevapp@oneconnectgroup.com","jan@doe.co.za","john@doe.co.za","king@doe.oc.za","kurisani@avsoft.co.za","Nathan@gmail.com","nthaum@gmali.com","pheladi@admin.com"];

    blockedEmail = {
        "bant@mail.com": true,"bob@delan.co.za": true,"bouncetest@tribulant.com": true,"demo@afriforum.co.za": true,"demo@blsa.org.za": true,"demo@edcon.co.za": true,"demo@flysaa.com": true,"demo@harmony.co.za": true,"demo@hugegroup.com": true,"demo@mcd.co.za": true,"demo@mediclinic.co.za": true,"demo@miway.co.za": true,"demo@sandvik.co.za": true,"demo@spar.co.za": true,"demo@telesure.co.za": true,"demo@thomsonreuters.com": true,"idpdevapp@oneconnectgroup.com": true,"jan@doe.co.za": true,"john@doe.co.za": true,"king@doe.oc.za": true,"kurisani@avsoft.co.za": true,"Nathan@gmail.com": true,"nthaum@gmali.com": true,"pheladi@admin.com":true, "andrewjackson.sa@gnail.com": true, "coreyschristensen@msn.com": true, "glpappkevin@gail.com": true, "magdaleen@liquidorance.co.za": true, "theov@uj.ac.za": true}

    var email = "king@doe.oc.za";
    var email1 = "cmwakio@gmail.com";
    
    var isBlocked = blockedEmail[email] ? true : false;
    var isBlocked1 = blockedEmail[email1] ? true : false;

    console.log(email+" isBlocked: ", isBlocked);
    console.log(email1+" isBlocked: ", isBlocked1);

    // RemoveUser();

    function RemoveUser() {
        var success = [];
        var failure = [];

        function callBatchMailer(task, callback) {
            console.log(`processing ${task}`);

            admin.database().ref('/users').orderByChild('email').equalTo(task).once('value').then(function(snapshot) {
                var exists = snapshot.exists();

                if(exists){
                    var key = snapshot.key;
                    var val = snapshot.val();
                    var following;
                    var userID;
                    var updates = {}

                    for (var x in val) {
                        var status = task+" userID: "+val[x].userID;
                        following = val[x].following;
                        userID = val[x].userID;
                        console.log(task+" val: ", val[x].userID);
                        success.push(status);
                    }

                    if(following != undefined){
                        for (var y in following) {
                            console.log("unsubscribe: "+userID+" from: ", y);
                            updates["followers/"+y+"/"+userID]=null;
                        }
    
                        // updates["users/"+childKey+"/receiveEmails"]=false;
                        // updates["user/"+uid+"/receiveEmails"]=false;
        
                        var userunsubscribed = admin.database().ref().update(updates).then(() =>{
                            return console.log("Unsubscribed: ",userID);
                        });
                    }
                    
                    // var userID = val.userID;

                    // var following = val.following;
                
                    // if(following != undefined){
                    //     var len = Object.keys(following).length;
                    // }else{
                    //     var len = 0
                    // }
                    
                    //     return callback();
                    // }
                    return callback();
                }else{
                    failure.push(task);
                    return callback();
                }
          
              
              
            });
            
        }        

        // create a queue object with concurrency 10
        var q = async.queue(callBatchMailer, 10);

        // assign a callback
        q.drain = function() {
            console.log("success processing: ",success);
            console.log("failure user emails: ", failure);
            console.log('All User Accounts have been processed');
        };

        // add some items to the queue (batch-wise)
        q.push(listofnewemails, function(err) {
            console.log('finished processing item');
        });

    };

});