const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config.js');
var rp = require('request-promise');

var nodemailer = require('nodemailer2');
var async = require("async");
var http = require("http");

// This will store emails needed to send.
var listofemails = [];
// Will store email sent successfully.
var success_email = [];
// Will store email whose sending is failed. 
var failure_email = [];
var listofoptions = {};

var transporter = nodemailer.createTransport({
    pool: true,
    host: 'comms.thinklead.co.za',
    port: 465,
    secure: true,
    auth: {
        user: "thinklead",
        pass: "qDoEOEZNqYr6"
    },
    maxConnections: 5,
    maxMessages: 100
});

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");

module.exports = function (){
    var that = this;
    this.serverKey = config.serverKey;
    this.project_id = config.senderID;

    this.headers = {
        'Accept': 'application/json',
        "Authorization": config.serverKey,
        "Content-Type": 'application/json'
    }

    this.send = function(msg){
        var url = 'https://fcm.googleapis.com/fcm/send';
        // delete this.headers['project_id'];
        this.headers['project_id'] = this.project_id;
        var options = {
            method: 'POST',
            uri: url,
            headers: this.headers,
            body: {
                "to": msg.notification_key,
                "notification": {
                    title: msg.payload.title,
                    body: msg.payload.body,
                    icon: msg.payload.icon,
                    sound: 'default',
                    badge: 1,
                    click_action: msg.payload.click_action
                }
            },
            json: true // Automatically stringifies the body to JSON"data": msg.payload
        };

        return that.fetch(options);
    }

    this.sendEmail = function sendEmails(options) {
        let mailOptions = {
            from: 'Global Leadership Platform <donotreply@thinklead.co.za>',
            to: ''+options.to,
            subject: ''+options.subject,
            text: ''+options.msgTxt,
            html: ''+options.msgHTML
        };

        // sgMail.send(mailOptions).then((response) => {
        //     console.log("sendEmail success.");
        //     return response;
        // }).catch(error => {
        //     //Log friendly error
        //     console.error("sendEmail Error: ",error.toString());
        //     return error;
        // });

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("Error sending mails 1: ",error);
            }else{
                return console.log('Message sent: %s', info.messageId);
            }
            
        });
    };

    this.sendNewUserEmail = function sendEmails(options) {
        let mailOptions = {
            from: 'Global Leadership Platform <donotreply@thinklead.co.za>',
            to: ''+options.to,
            bcc: ''+options.bcc,
            subject: ''+options.subject,
            text: ''+options.msgTxt,
            html: ''+options.msgHTML
        };

        // sgMail.send(mailOptions).then((response) => {
        //     console.log("sendNewUserEmail Success");
        //     return response;
        // }).catch(error => {
        //     //Log friendly error
        //     console.error("sendNewUserEmail Error: ",error.toString());
        //     return error;
        // });

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("Error sending mails 2:",error);
            }else{
                return console.log('Message sent: %s', info.messageId);
            }
            
        });
    };

    this.sendNodeEmail = function sendMail(options) {
        let htmlTemplate = this.htmlTemplate(options);
        
        let mailOptions = {
            from: 'Global Leadership Platform <donotreply@thinklead.co.za>',
            to: ''+options.to,
            subject: ''+options.subject,
            text: ''+options.msgTxt,
            html: htmlTemplate
        };

        // sgMail.send(mailOptions).then((response) => {
        //     console.error("sendNodeEmail Success");
        //     return response;
        // }).catch(error => {
        //     //Log friendly error
        //     console.error("sendNodeEmail Error: ",error.toString());
        //     return error;
        // });

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("Error sending mails 3: ",error);
            }else{
                return console.log('Message sent: %s', info.messageId);
            }
            
        });
    
    };

    this.add = function(device){ //Add this token to user notification devices
        var url = 'https://fcm.googleapis.com/fcm/notification';
        this.headers['project_id'] = this.project_id;
        var options = {
            method: 'POST',
            uri: url,
            headers: this.headers,
            body: {
                "operation": "add",
                "notification_key_name": device.uid,
                "notification_key": device.notification_key,
                "registration_ids": device.reg_ids
            },
            json: true // Automatically stringifies the body to JSON
        };

        return that.fetch(options);
    }

    this.remove = function(device){ //Remove the given token key from notification devices
        var url = 'https://fcm.googleapis.com/fcm/notification';
        // delete this.headers['project_id'];
        this.headers['project_id'] = this.project_id;
        var options = {
            method: 'POST',
            uri: url,
            headers: this.headers,
            body: {
                "operation": "remove",
                "notification_key_name": device.uid,
                "notification_key": device.notification_key,
                "registration_ids": device.reg_ids
             },
            json: true // Automatically stringifies the body to JSON
        };

        return that.fetch(options);
    }

    this.create = function(device){ //Create a group and add the devices
        var url = 'https://fcm.googleapis.com/fcm/notification';
        this.headers['project_id'] = this.project_id;
        var options = {
            method: 'POST',
            uri: url,
            headers: this.headers,
            body: {
                "operation": "create",
                "notification_key_name": device.uid,
                "registration_ids": device.reg_ids
            },
            json: true // Automatically stringifies the body to JSON
        };

        return that.fetch(options);
    }

    this.getNotificationKey = function(uid){ //Retrieve a notification key
        var url = 'https://fcm.googleapis.com/fcm/notification';
        this.headers['project_id'] = this.project_id;
        this.headers['content-length'] = 0;
        var options = {
            method: 'GET',
            uri: url, 
            headers: this.headers,
            qs: {
                notification_key_name: uid // -> uri + '?access_token=xxxxx%20xxxxx'
            },
            body: {},
            json: true // Automatically stringifies the body to JSON
        };

        return that.fetch(options);
    }

    this.fetch = function(fetchOptions){
        rp(fetchOptions)
        .then(function (body) {

            if(fetchOptions.method == "GET"){
                // if you're getting - set returned key to the user account
                var notification_key_name = fetchOptions["qs"]["notification_key_name"];
                var notification_key = body["notification_key"];

                var updates = {};
                updates['user/'+notification_key_name+'/notification_key'] = notification_key;
                admin.database().ref().update(updates)

                // console.log('Options GET: ', fetchOptions["qs"]["notification_key_name"]);
                // console.log('Function key: ', body["notification_key"]);
            }else{
                var operation = fetchOptions["body"]["operation"];

                if(operation == "add" || operation == "remove" || operation == "create"){
                    var notification_key_name = fetchOptions["body"]["notification_key_name"];
                    var notification_key = body["notification_key"];

                    var updates = {};
                    updates['user/'+notification_key_name+'/notification_key'] = notification_key;
                    admin.database().ref().update(updates)
                }

                console.log('Function response: ', body);
            }
            
        })
        .catch(function (err) {
            // API call failed...
            console.log("error on request: ", err.statusCode);
            console.log("error: ", err.error);
        });
    }

    this.testBatchEmails = function(options){
        // listofemails = ["cmwakio@gmail.com","colman@oneconnect.co.za","riaan@oneconnect.co.za","riaan@oneconnectgroup.com"];
        listofemails = ["cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com", "cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com", "cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com","cmwakio@gmail.com","colman@oneconnect.co.za","kolmann2000@yahoo.com"];

        let htmlTemplate = this.htmlTemplate(options);

        function callBatchMailer(task, callback) {
            console.log(`processing ${task}`);

            let mailOptions = {
                from: 'Global Leadership Platform <thinklead@comms.thinklead.co.za>',
                to: ''+task,
                subject: ''+options.subject,
                text: ''+options.msgTxt,
                html: htmlTemplate
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error sending mails: ",error);
                    failure_email.push(task);
                    return callback();
                }else{
                    console.log('Message sent: %s', info.messageId);
                    success_email.push(task);
                    return callback();
                }
                
            });
        }        

        // create a queue object with concurrency 10
        var q = async.queue(callBatchMailer, 10);

        // assign a callback
        q.drain = function() {
            console.log("success emails: ",success_email);
            console.log("failure_email: ", failure_email);
            console.log('All Emails have been processed');
        };

        // add some items to the queue (batch-wise)
        q.push(listofemails, function(err) {
            console.log('finished processing item');
        });
        
    }

    this.sendBatchMails = function(options){
        var all = options.all;
        var postcompanyID = options.companyID;

        return admin.database().ref('/followers/'+options.userID).once('value').then(function(snapshot) {
            listofemails = [];
            success_email = [];
            failure_email = [];
            
            // console.log(listofemails.length);
        
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var email = childData.email;
                var companyID = childData.companyID

                if(email != undefined){
                    if(all == true){
                        listofemails.push(email);
                    }else{
                        if(companyID == postcompanyID){
                            listofemails.push(email);
                        }
                    }
                }
                // console.log("email : ",email);

            });

            if(listofemails && listofemails.length > 0){
                that.massMailer(options);
            }
    
            return snapshot;
        });
    }

    /* Loading modules done. */
    this.massMailer = function massMailer(options) {
        var self = this;
        // Fetch all the emails from database and push it in listofemails
        // Will do it later.
        self.invokeOperation(options);
    };

    /* Invoking email sending operation at once */

    this.invokeOperation = function(options) {
        var self = this;
        listofoptions = options;

        async.each(listofemails,self.SendBatchEmail,function(){
            console.log("success emails: ",success_email);
            console.log("failure_email: ", failure_email);
        });
    }

    /* 
    * This function will be called by multiple instance.
    * Each instance will contain one email ID
    * After successfull email operation, it will be pushed in failed or success array.
    */
    this.SendBatchEmail = function(Email,callback) {
        console.log("Sending email to " + Email);
        var self = this;
        self.status = false;
        // waterfall will go one after another
        // So first email will be sent
        // Callback will jump us to next function
        // in that we will update DB
        // Once done that instance is done.
        // Once every instance is done final callback will be called.
        async.waterfall([
            function(callback) {
                let msgHTML = that.htmlTemplate(listofoptions);

                console.log("got html msg")

                let mailOptions = {
                    from: 'Global Leadership Platform <donotreply@thinklead.co.za>',
                    to: ''+Email,
                    subject: ''+listofoptions.subject,
                    text: ''+listofoptions.msgTxt,
                    html: ''+msgHTML
                };

                // transporter.sendMail(mailOptions, function(error, info) {       
                //     if(error) {
                //         console.log("Error sending mail 5: ",error)
                //         failure_email.push(Email);
                //     } else {
                //         self.status = true;
                //         success_email.push(Email);
                //     }
                //     callback(null,self.status,Email);
                // });

                sgMail.send(mailOptions).then((response) => {
                    console.log("send waterfall email Success");
                    callback(null,self.status,Email);
                    // return response;
                }).catch(error => {
                    //Log friendly error
                    console.error("send waterfall emails Error: ",error.toString());
                    callback(null,self.status,Email);
                    // return error;
                });
                
            },
            function(statusCode,Email,callback) {
                    console.log("Will update DB here for " + Email + " With " + statusCode);
                    callback();
            }
            ],function(){
                //When everything is done return back to caller.
                callback();
        });
    }

    this.htmlTemplate = function(options)  {
        var photoURL = options.photoURL;
        var notificationMsg = options.notificationMsg;
        var userName = options.userName;
        var notificationURL = options.notificationURL;

        return '<a href="'+notificationURL+'" style="text-decoration:none" target="_blank"> <table border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;background:#ffffff"><table border="0" width="100%" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td height="20" style="line-height:20px" colspan="3">&nbsp;</td></tr><tr><td height="1" colspan="3" style="line-height:1px"><span style="color:#ffffff;display:none!important;font-size:1px">GLP</span></td></tr><tr><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td><td><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td height="16" style="line-height:16px" colspan="3">&nbsp;</td></tr><tr><td width="32" align="left" valign="middle" style="height:32;line-height:0px"><a href="'+notificationURL+'" style="color:#c3272e;text-decoration:none" target="_blank"><img src="https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Ficon-32x32.png?alt=media&token=9ea331d7-a876-45be-b702-a6094ddc42f1" width="32" height="32" style="border:0"></a></td><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td><td width="100%"><a href="'+notificationURL+'" style="color:#000000;text-decoration:none;font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:19px;line-height:32px" target="_blank">Global Leadership Platform</a></td></tr><tr style="border-bottom:solid 1px #e5e5e5"><td height="16" style="line-height:16px" colspan="3">&nbsp;</td></tr></tbody></table></td><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td></tr><tr><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td><td><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; max-width: 360px;"><tbody><tr><td style="font-size:11px;font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;border:solid 1px #e5e5e5;border-radius:2px 2px 0 0;padding:10px;display:block"><table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td style="width: 50px!important;"><img src="'+photoURL+'" width="50" height="50" style="border:0"></td><td width="4" style="display:block;width:4px">&nbsp;&nbsp;&nbsp;</td><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823"><b>'+userName+'</b></td></tr></tbody></table></td></tr><tr><td width="100%"><table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823">'+notificationMsg+'</td></tr><tr><td><span class="m_8884097947606335835mb_text" style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:12px;line-height:19px;color:#898f9c">&nbsp;&nbsp;&nbsp;</span></td></tr></tbody></table></td></tr><tr><td valign="middle"><a href="'+notificationURL+'" style="color:#c3272e;text-decoration:none" target="_blank"><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td style="border-collapse:collapse;border-radius:2px;text-align:center;display:block;border:solid 1px #c3272e;background:#c3272e;padding:7px 16px 11px 16px"><a href="'+notificationURL+'" style="color:#c3272e;text-decoration:none;display:block" target="_blank"><center><font size="3"><span style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;white-space:nowrap;font-weight:bold;vertical-align:middle;color:#fff;font-size:14px;line-height:14px">Open</span></font></center></a></td></tr></tbody></table></a></td></tr></tbody></table></td></tr></tbody></table></td><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td></tr></tbody></table></td></tr></tbody></table> </a>';

    }

}