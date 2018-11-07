const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config.js');

exports.unsubscribeUsers = functions.https.onRequest((req, res) => {
    
    var email = req.query.email;
    var type = req.query.type;
    var confirmed = req.query.confirmed;
    var unsubscribeurl = config.serverurl+'m13-unsubscribeUsers?email='+email+'&type=posts&confirmed=true'

    if(confirmed == "true"){
        var resText = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Unsubscribe user from GLP</title></head><body style="margin:0;padding:0;"><header><header><table border="0" cellspacing="0" cellpadding="0" align="center" style="max-width:480px;"><tr><td><table><tr><td height="16" style="line-height:16px" colspan="3"><img src="https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Ficon-32x32.png?alt=media&token=9ea331d7-a876-45be-b702-a6094ddc42f1" width="32" height="32" style="border:0"></td><td><h3>Global Leadership Platform</h3></td></tr></table></td></tr><tr><td style="font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;border:solid 1px #e5e5e5;border-radius:2px 2px 0 0;padding:10px;display:block"><table align="center"><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823"><b>Successfully unsubscribed '+email+'</b></td></tr><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:12px;line-height:21px;color:#141823"><i>If you wish to subscribe to email notifications again, you can do so by changing the settings in your user profile within the Global Leadership Platform.<i/> </td></tr></table></td></tr></table></body></html>';

        var unsubscribeuser = admin.database().ref('user').orderByChild('email').equalTo(email)
        .once('value').then(function (snapshot) {            
            snapshot.forEach(function(childSnapshot) {

                var childData = childSnapshot.val();
                var updates = {}
                var userID = childData.userID;

                var subscriber = {
                    userID:userID,
                    companyID:childData.companyID,
                    email:childData.email,
                    dateRegistered:Date.now()
                }

                updates["unsubscribed/"+userID]=subscriber;

                var userunsubscribed = admin.database().ref().update(updates).then(() =>{
                    return console.log("Unsubscribed: ",email);
                });         
                
            });

            return snapshot;
        });

        res.send(resText);
    }else{
        if(type=='posts'){
            var resText = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Unsubscribe user from GLP</title></head><body style="margin:0;padding:0;"><header><header><table border="0" cellspacing="0" cellpadding="0" align="center" style="max-width:480px;"><tr><td><table><tr><td height="16" style="line-height:16px" colspan="3"><img src="https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Ficon-32x32.png?alt=media&token=9ea331d7-a876-45be-b702-a6094ddc42f1" width="32" height="32" style="border:0"></td><td><h3>Global Leadership Platform</h3></td></tr></table></td></tr><tr><td style="font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;border:solid 1px #e5e5e5;border-radius:2px 2px 0 0;padding:10px;display:block"><table align="center"><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823"><b>Would you like to stop receiving this email notification?</b></td></tr><tr><td style="padding:0px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:18px;color:#292f33;padding:10px;">You will no longer receive email notification for new posts from Global Leadership Platform</td></tr><tr><td style="border-collapse:collapse;border-radius:2px;text-align:center;display:block;border:solid 1px #c3272e;background:#c3272e;padding:7px 16px 11px 16px"><a href="'+unsubscribeurl+'" style="color:#c3272e;text-decoration:none;display:block"><center><font size="3"><span style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;white-space:nowrap;font-weight:bold;vertical-align:middle;color:#fff;font-size:14px;line-height:14px">Confirm</span></font></center></a></td></tr></table></td></tr></table></body></html>';
        }else if(type=='pldp'){
            var resText = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Unsubscribe user from GLP</title></head><body style="margin:0;padding:0;"><header><header><table border="0" cellspacing="0" cellpadding="0" align="center" style="max-width:480px;"><tr><td><table><tr><td height="16" style="line-height:16px" colspan="3"><img src="https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Ficon-32x32.png?alt=media&token=9ea331d7-a876-45be-b702-a6094ddc42f1" width="32" height="32" style="border:0"></td><td><h3>Global Leadership Platform</h3></td></tr></table></td></tr><tr><td style="font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;border:solid 1px #e5e5e5;border-radius:2px 2px 0 0;padding:10px;display:block"><table align="center"><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823"><b>Successfully unsubscribed '+email+'</b></td></tr><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:12px;line-height:21px;color:#141823"><i>If you wish to subscribe to email notifications again, you can do so by changing the settings in your user profile within the Global Leadership Platform.<i/> </td></tr></table></td></tr></table></body></html>';

            var action = req.query.action;
            var notification = req.query.notification;

            console.log("action: ",action, " notification: ",notification);

            // 'http://localhost:5000/glp-test/us-central1/m13-unsubscribeUsers?email=cmwakio@gmail.com&type=pldp&action=srgiSWBqBjSnBlb3xxR5ua2IX9F3&notification=-Kwoqx98yZsUZhlJDWj7'

            if((notification != undefined)  && (action != undefined)){
                var notificationUpdates = {};
                notificationUpdates['/users/' + notification+'/receivePLDPEmails'] = false;
                notificationUpdates['/user/' + action+'/receivePLDPEmails'] = false;

                var userunsubscribed = admin.database().ref().update(notificationUpdates).then(() =>{
                    return console.log("PLDP Unsubscribed: ",email, " ID: ",notification);
                }); 
            }

        }else{
            var resText = "Global Leadership Platform";
        }

        res.send(resText);
    } 

});