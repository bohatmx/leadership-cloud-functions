const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config.js");
var rp = require("request-promise");

var nodemailer = require("nodemailer2");
var async = require("async");
var http = require("http");

// This will store emails needed to send.
var listofemails = [];
// Will store email sent successfully.
var success_email = [];
// Will store email whose sending is failed.
var failure_email = [];

var sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

// const companies = require('../configs/get-companies');

module.exports = function() {
  var that = this;
  this.serverKey = config.serverKey[config.environment];
  this.project_id = config.senderID;

  this.headers = {
    Accept: "application/json",
    Authorization: config.serverKey[config.environment],
    "Content-Type": "application/json"
  };

  this.createNotifications = function(all, options, notificationData) {
    // create mailnotification
    var mailUpdates = {};
    var mailNotificationID = admin
      .database()
      .ref()
      .child("mailNotifications")
      .push().key;
    mailUpdates[
      "mailNotifications/" + mailNotificationID + "/" + "mailNotificationID"
    ] = mailNotificationID;
    mailUpdates[
      "mailNotifications/" + mailNotificationID + "/" + "options"
    ] = options;
    mailUpdates["mailNotifications/" + mailNotificationID + "/" + "all"] = all;

    admin
      .database()
      .ref()
      .update(mailUpdates)
      .then(postsupdate => {
        console.log("creating mail notification");
      })
      .catch(posts_err => {
        console.log("creating mail error");
      });

    // create analytics update
    var analyticsUpdates = {};
    var analyticsNotificationID = admin
      .database()
      .ref()
      .child("analyticsNotifications")
      .push().key;
    analyticsUpdates[
      "analyticsNotifications/" +
        analyticsNotificationID +
        "/" +
        "analyticsNotificationID"
    ] = analyticsNotificationID;
    analyticsUpdates[
      "analyticsNotifications/" +
        analyticsNotificationID +
        "/" +
        "notificationData"
    ] = notificationData;
    analyticsUpdates[
      "analyticsNotifications/" + analyticsNotificationID + "/" + "all"
    ] = all;

    admin
      .database()
      .ref()
      .update(analyticsUpdates)
      .then(postsupdate => {
        console.log("creating analytics notifications");
      })
      .catch(posts_err => {
        console.log("creating analytics error");
      });

    // create appNotifications
    var appNotificationID = admin
      .database()
      .ref()
      .child("appNotifications")
      .push().key;
    notificationData.appNotificationID = appNotificationID;
    notificationData.all = all;
    // Write the new notification's data
    var updates = {};
    updates["appNotifications/" + appNotificationID] = notificationData;
    admin
      .database()
      .ref()
      .update(updates)
      .then(postsupdate => {
        console.log("creating app notifications");
      })
      .catch(posts_err => {
        console.log("creating app notifications error");
      });
  };

  this.send = function(msg) {
    var url = "https://fcm.googleapis.com/fcm/send";
    // delete this.headers['project_id'];
    this.headers["project_id"] = this.project_id;
    var options = {
      method: "POST",
      uri: url,
      headers: this.headers,
      body: {
        to: msg.notification_key,
        notification: {
          title: msg.payload.title,
          body: msg.payload.body,
          icon: msg.payload.icon,
          sound: "default",
          badge: 1,
          click_action: msg.payload.click_action
        }
      },
      json: true // Automatically stringifies the body to JSON"data": msg.payload
    };

    return that.fetch(options);
  };

  this.sendEmail = function sendEmails(options) {
    var transporter = nodemailer.createTransport({
      pool: true,
      host: "comms.thinklead.co.za",
      port: 465,
      secure: true,
      auth: {
        user: "thinklead@comms.thinklead.co.za",
        pass: "wR3(7FPMQvUwa-u&"
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      maxConnections: 150,
      maxMessages: 100
    });

    // Check if Email is blocked
    var isBlocked = that.bouncedEmails(options.to);
    console.log(options.to + " isBlocked: " + isBlocked);

    if (isBlocked == false) {
      let mailOptions = {
        from: "Global Leadership Platform <thinklead@comms.thinklead.co.za>",
        to: "" + options.to,
        subject: "" + options.subject,
        text: "" + options.msgTxt,
        html: "" + options.msgHTML
      };

      // sgMail.send(mailOptions).then((response) => {
      //     console.log("sendEmail success.");
      //     return response;
      // }).catch(error => {
      //     //Log friendly error
      //     console.error("sendEmail Error: ",error.toString());
      //     return error;
      // });

      // Only send emails on live environment
      if (config.environment === 1) {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log("Error sending mails 1: ", error);
          } else {
            return console.log("Message sent: %s", info.messageId);
          }
        });
      } else {
        console.log("Test environment...not sending any emails 111");
      }
    }
  };

  this.sendNewUserEmail = function sendEmails(options) {
    var listofnewemails = [];
    var successnew_email = [];
    var failurenew_email = [];

    console.log("mail options for new user: ", options);

    // Check if Email is blocked
    var isBlocked = that.bouncedEmails(options.to);
    console.log(options.to + " isBlocked: " + isBlocked);

    if (isBlocked == false) {
      listofnewemails.push(options);

      var transporter = nodemailer.createTransport({
        pool: true,
        host: "comms.thinklead.co.za",
        port: 465,
        secure: true,
        auth: {
          user: "thinklead@comms.thinklead.co.za",
          pass: "wR3(7FPMQvUwa-u&"
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        },
        maxConnections: 150,
        maxMessages: 100
      });

      function callBatchMailer(task, callback) {
        console.log(`processing ${task.to}`);

        let mailOptions = {
          from: "Global Leadership Platform <thinklead@comms.thinklead.co.za>",
          to: "" + task.to,
          bcc: "" + task.bcc,
          subject: "" + task.subject,
          text: "" + task.msgTxt,
          html: "" + task.msgHTML
        };

        // Only send emails on live environment
        // if (config.environment === 1) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending mails 2: ", error);
            failurenew_email.push(task.to);
            return callback();
          } else {
            console.log("Message sent: %s", info.messageId);
            successnew_email.push(task.to);
            return callback();
          }
        });
        // } else {
        //   console.log("Test environment...not sending any emails 222");
        // }
      }

      // create a queue object with concurrency 10
      var q = async.queue(callBatchMailer, 5);

      // assign a callback
      q.drain = function() {
        console.log("success new user emails: ", successnew_email);
        console.log("failure new user emails: ", failurenew_email);
        console.log("All New User Emails have been processed");
      };

      // add some items to the queue (batch-wise)
      q.push(listofnewemails, function(err) {
        console.log("finished processing item");
      });
    } // End if Email not Blocked
  };

  this.sendNodeEmail = function sendMail(options, link) {
    var transporter = nodemailer.createTransport({
      pool: true,
      host: "comms.thinklead.co.za",
      port: 465,
      secure: true,
      auth: {
        user: "thinklead@comms.thinklead.co.za",
        pass: "wR3(7FPMQvUwa-u&"
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      maxConnections: 150,
      maxMessages: 100
    });

    // Check if Email is blocked
    var isBlocked = that.bouncedEmails(options.to);
    console.log(options.to + " isBlocked: " + isBlocked);

    if (isBlocked == false) {
      var unsubscribelink =
        config.serverurl[config.environment] + "m13-unsubscribeUsers?" + link;
      let htmlTemplate = this.htmlTemplate(
        options,
        unsubscribelink,
        options.companyURL
      );

      let mailOptions = {
        from: "Global Leadership Platform <thinklead@comms.thinklead.co.za>",
        to: "" + options.to,
        subject: "" + options.subject,
        text: "" + options.msgTxt,
        html: htmlTemplate
      };

      // Only send emails on live environment
      if (config.environment === 1) {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log("Error sending mails 3: ", error);
          } else {
            return console.log("Message sent: %s", info.messageId);
          }
        });
      } else {
        console.log("Test environment...not sending any emails 333");
      }
    } //End if Email is not Blocked
  };

  this.add = function(device) {
    //Add this token to user notification devices
    var url = "https://fcm.googleapis.com/fcm/notification";
    this.headers["project_id"] = this.project_id;
    var options = {
      method: "POST",
      uri: url,
      headers: this.headers,
      body: {
        operation: "add",
        notification_key_name: device.uid,
        notification_key: device.notification_key,
        registration_ids: device.reg_ids
      },
      json: true // Automatically stringifies the body to JSON
    };

    return that.fetch(options);
  };

  this.remove = function(device) {
    //Remove the given token key from notification devices
    var url = "https://fcm.googleapis.com/fcm/notification";
    // delete this.headers['project_id'];
    this.headers["project_id"] = this.project_id;
    var options = {
      method: "POST",
      uri: url,
      headers: this.headers,
      body: {
        operation: "remove",
        notification_key_name: device.uid,
        notification_key: device.notification_key,
        registration_ids: device.reg_ids
      },
      json: true // Automatically stringifies the body to JSON
    };

    return that.fetch(options);
  };

  this.create = function(device) {
    //Create a group and add the devices
    var url = "https://fcm.googleapis.com/fcm/notification";
    this.headers["project_id"] = this.project_id;
    var options = {
      method: "POST",
      uri: url,
      headers: this.headers,
      body: {
        operation: "create",
        notification_key_name: device.uid,
        registration_ids: device.reg_ids
      },
      json: true // Automatically stringifies the body to JSON
    };

    return that.fetch(options);
  };

  this.getNotificationKey = function(uid) {
    //Retrieve a notification key
    var url = "https://fcm.googleapis.com/fcm/notification";
    this.headers["project_id"] = this.project_id;
    this.headers["content-length"] = 0;
    var options = {
      method: "GET",
      uri: url,
      headers: this.headers,
      qs: {
        notification_key_name: uid // -> uri + '?access_token=xxxxx%20xxxxx'
      },
      body: {},
      json: true // Automatically stringifies the body to JSON
    };

    return that.fetch(options);
  };

  this.fetch = function(fetchOptions) {
    rp(fetchOptions)
      .then(function(body) {
        if (fetchOptions.method == "GET") {
          // if you're getting - set returned key to the user account
          var notification_key_name =
            fetchOptions["qs"]["notification_key_name"];
          var notification_key = body["notification_key"];

          var updates = {};
          updates[
            "user/" + notification_key_name + "/notification_key"
          ] = notification_key;
          admin
            .database()
            .ref()
            .update(updates);

          // console.log('Options GET: ', fetchOptions["qs"]["notification_key_name"]);
          // console.log('Function key: ', body["notification_key"]);
        } else {
          var operation = fetchOptions["body"]["operation"];

          if (
            operation == "add" ||
            operation == "remove" ||
            operation == "create"
          ) {
            var notification_key_name =
              fetchOptions["body"]["notification_key_name"];
            var notification_key = body["notification_key"];

            var updates = {};
            updates[
              "user/" + notification_key_name + "/notification_key"
            ] = notification_key;
            admin
              .database()
              .ref()
              .update(updates);
          }

          console.log("Function response: ", body);
        }
      })
      .catch(function(err) {
        // API call failed...
        // console.log("error on request: ", err.statusCode);
        // console.log("error: ", err.error);
      });
  };

  this.testBatchEmails = function(options) {
    // For Testing
    var user = {
      email: "cmwakio@gmail.com",
      companyID: companies["prod"]
    };
    listofemails = ["cmwakio@gmail.com", "colman@oneconnect.co.za"];

    if (listofemails && listofemails.length > 0) {
      that.massMailer(options);
    }
  };

  this.getCompanyURL = function(companyID) {
    // Signed up corporate
    // New Edcon => -LOs4iZh3Y9LSiNtpWlH
    // Old Edcon => -LBPcsCl4Dp7BsYB8fjE
    // OneConnect => -LDVbbRyIMhukVtTVQ0n
    // BLSA => -LT2GkDrMhj3Tsx7KCme

    // Live environment
    if (config.environment === 1) {
      //
      if (companyID == "-LDVbbRyIMhukVtTVQ0n")
        return "https://oneconnect.thinklead.co.za/";
      else if (
        companyID == "-LOs4iZh3Y9LSiNtpWlH" ||
        companyID == "-LBPcsCl4Dp7BsYB8fjE"
      )
        return "https://edcon.thinklead.co.za/";
      else if (companyID == "-LT2GkDrMhj3Tsx7KCme")
        return "https://blsa.thinklead.co.za/";
      else return "https://thinklead.app/";
    } else {
      //return test url
      return config.url[0];
    }
  };

  this.getPldpUrl = function(companyID) {
    // Signed up corporate
    // New Edcon => -LOs4iZh3Y9LSiNtpWlH
    // Old Edcon => -LBPcsCl4Dp7BsYB8fjE
    // OneConnect => -LDVbbRyIMhukVtTVQ0n
    // BLSA => -LT2GkDrMhj3Tsx7KCme

    // Live environment
    if (config.environment === 1) {
      //
      if (companyID == "-LDVbbRyIMhukVtTVQ0n") return "my-pldp";
      else if (
        companyID == "-LOs4iZh3Y9LSiNtpWlH" ||
        companyID == "-LBPcsCl4Dp7BsYB8fjE"
      )
        return "my-pldp";
      else if (companyID == "-LT2GkDrMhj3Tsx7KCme") return "my-pldp";
      else return "pldp";
    } else {
      //return test url
      return "pldp";
    }
  };

  this.bouncedEmails = function(email) {
    blockedEmail = {
      "bant@mail.com": true,
      "bob@delan.co.za": true,
      "bouncetest@tribulant.com": true,
      "demo@afriforum.co.za": true,
      "demo@blsa.org.za": true,
      "demo@edcon.co.za": true,
      "demo@flysaa.com": true,
      "demo@harmony.co.za": true,
      "demo@hugegroup.com": true,
      "demo@mcd.co.za": true,
      "demo@mediclinic.co.za": true,
      "demo@miway.co.za": true,
      "demo@sandvik.co.za": true,
      "demo@spar.co.za": true,
      "demo@telesure.co.za": true,
      "demo@thomsonreuters.com": true,
      "idpdevapp@oneconnectgroup.com": true,
      "jan@doe.co.za": true,
      "john@doe.co.za": true,
      "king@doe.oc.za": true,
      "kurisani@avsoft.co.za": true,
      "Nathan@gmail.com": true,
      "nthaum@gmali.com": true,
      "pheladi@admin.com": true,
      "andrewjackson.sa@gnail.com": true,
      "coreyschristensen@msn.com": true,
      "glpappkevin@gail.com": true,
      "magdaleen@liquidorance.co.za": true,
      "theov@uj.ac.za": true,
      "<Debbie@econetmedia.com>": true,
      "Debbie@econetmedia.com": true,
      "demo@motovantage.co.za": true,
      "<demo@hugegroup.com>": true,
      "<demo@mediclinic.co.za>": true,
      "<demo@miway.co.za>": true,
      "<demo@motovantage.co.za>": true,
      "<demo@spar.co.za>": true,
      "<edith@unltdgrp.com>": true,
      "edith@unltdgrp.com": true,
      "<garethg@energysecurity.co.za>": true,
      "garethg@energysecurity.co.za": true,
      "<gordon@gordontredgold.com>": true,
      "gordon@gordontredgold.com": true,
      "<lara@peacefulmind.co.za>": true,
      "lara@peacefulmind.co.za": true,
      "<mantsha@oneconnnect.co.za>": true,
      "mantsha@oneconnnect.co.za": true,
      "<Nkululeko.Ngcobo@avsoft.co.za>": true,
      "Nkululeko.Ngcobo@avsoft.co.za": true,
      "<servaas.duplessis@eoh.com>": true,
      "servaas.duplessis@eoh.com": true,
      "<willem@gous.ws>": true,
      "willem@gous.ws": true,
      "<bertie@aliberti.co.za>": true,
      "bertie@aliberti.co.za": true,
      "<vuyokazi.bata@yahoo.co.uk>": true,
      "vuyokazi.bata@yahoo.co.uk": true,
      "demo@wilfordscholes.com": true,
      "test@oneconnect.co.za": true
    };

    return blockedEmail[email] ? true : false;
  };

  this.sendBatchMails = function(options) {
    var all = options.all;
    var postcompanyID = options.companyID;
    var companyURL = "https://thinklead.app/";

    var getfollowers = admin
      .database()
      .ref("/followers/" + options.userID)
      .once("value")
      .then(function(snapshot) {
        listofemails = [];
        success_email = [];
        failure_email = [];

        console.log("mail options: ", options);
        console.log("received followers to send email to");
        var cnt = 0;

        // console.log(listofemails.length);

        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();

          var email = childData.email;
          var companyName = childData.companyName;
          var companyID = childData.companyID;

          companyURL = that.getCompanyURL(companyID);
          console.log("company url: ", companyURL);
          console.log("company id: ", companyID);
          console.log("Email: ", email);
          console.log("childData: ", childData);
          console.log("cnt: ", cnt);

          var userinfo = {};
          userinfo.companyURL = companyURL;

          if (email != undefined) {
            if (all == true) {
              console.log("sending to all");
              console.log("Subscribed, push to emails ", email);
              userinfo.email = email;

              var isBlocked = that.bouncedEmails(email);
              console.log(email + " isBlocked: " + isBlocked);

              if (isBlocked == false) {
                listofemails.push(userinfo);
              }
            } else {
              if (companyID == postcompanyID) {
                console.log("sending to company");
                console.log("Subscribed, push to emails ", email);
                userinfo.email = email;

                var isBlocked = that.bouncedEmails(email);

                console.log(email + " isBlocked: " + isBlocked);

                if (isBlocked == false) {
                  listofemails.push(userinfo);
                }
              }
            }
          }
          cnt++;
          // console.log("email : ",email);
        });

        // console.log("listofemails: ",listofemails);

        // if (listofemails && listofemails.length > 0) {
        //   console.log("list of emails to notify: ", listofemails);
        //   that.massMailer(options);
        // } else {
        //   console.error(
        //     "Length of listofemails is less than zero: ",
        //     listofemails
        //   );
        // }

        return snapshot;
      });

    return getfollowers;
  };

  this.massMailer = function massMailer(options) {
    var self = this;

    var transporter = nodemailer.createTransport({
      pool: true,
      host: "comms.thinklead.co.za",
      port: 465,
      secure: true,
      auth: {
        user: "thinklead@comms.thinklead.co.za",
        pass: "wR3(7FPMQvUwa-u&"
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      maxConnections: 150,
      maxMessages: 100
    });

    // transporter.close();

    function callBatchMailer(task, callback) {
      console.log(`processing ${task.email}`);
      var unsubscribelink =
        config.serverurl[config.environment] +
        "m13-unsubscribeUsers?email=" +
        task.email +
        "&type=posts";
      let htmlTemplate = self.htmlTemplate(
        options,
        unsubscribelink,
        task.companyURL
      );

      var mailOptions = {
        from: "Global Leadership Platform <thinklead@comms.thinklead.co.za>",
        to: "" + task.email,
        subject: "" + options.subject,
        text: "" + options.msgTxt,
        html: htmlTemplate
      };

      // Only send emails on live environment
      if (config.environment === 1) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error sending mails: ", error);
            failure_email.push(task.email);
            return callback();
          } else {
            console.log("Message sent: %s", info.messageId);
            success_email.push(task.email);
            return callback();
          }
        });
      } else {
        console.log("Test environment...not sending any emails 444");
      }
    }

    // create a queue object with concurrency 10
    var q = async.queue(callBatchMailer, 5);

    // assign a callback
    q.drain = function() {
      console.log("success emails: ", success_email);
      console.log("failure_email: ", failure_email);
      console.log("All Emails have been processed");
    };

    // add some items to the queue (batch-wise)
    q.push(listofemails, function(err) {
      console.log("finished processing item");
    });
  };

  this.htmlTemplate = function(options, unsubscribelink, companyURL) {
    var photoURL = options.photoURL;
    var notificationMsg = options.notificationMsg;
    var userName = options.userName;
    var notificationURL = options.notificationURL;

    return (
      '<a href="' +
      companyURL +
      notificationURL +
      '" style="text-decoration:none" target="_blank"> <table border="0" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;background:#ffffff"><table border="0" width="100%" cellspacing="0" cellpadding="0" align="center"><tbody><tr><td height="20" style="line-height:20px" colspan="3">&nbsp;</td></tr><tr><td height="1" colspan="3" style="line-height:1px"><span style="color:#ffffff;display:none!important;font-size:1px">GLP</span></td></tr><tr><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td><td><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td height="16" style="line-height:16px" colspan="3">&nbsp;</td></tr><tr><td width="32" align="left" valign="middle" style="height:32;line-height:0px"><a href="' +
      companyURL +
      notificationURL +
      '" style="color:#c3272e;text-decoration:none" target="_blank"><img src="https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Ficon-32x32.png?alt=media&token=9ea331d7-a876-45be-b702-a6094ddc42f1" width="32" height="32" style="border:0"></a></td><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td><td width="100%"><a href="' +
      companyURL +
      notificationURL +
      '" style="color:#000000;text-decoration:none;font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:19px;line-height:32px" target="_blank">Global Leadership Platform</a></td></tr><tr style="border-bottom:solid 1px #e5e5e5"><td height="16" style="line-height:16px" colspan="3">&nbsp;</td></tr></tbody></table></td><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td></tr><tr><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td><td><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; max-width: 360px;"><tbody><tr><td style="font-size:11px;font-family:LucidaGrande,tahoma,verdana,arial,sans-serif;border:solid 1px #e5e5e5;border-radius:2px 2px 0 0;padding:10px;display:block"><table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td style="width: 50px!important;"><img src="' +
      photoURL +
      '" width="50" height="50" style="border:0"></td><td width="4" style="display:block;width:4px">&nbsp;&nbsp;&nbsp;</td><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823"><b>' +
      userName +
      '</b></td></tr></tbody></table></td></tr><tr><td width="100%"><table border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:14px;line-height:21px;color:#141823">' +
      notificationMsg +
      '</td></tr><tr><td><span class="m_8884097947606335835mb_text" style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;font-size:12px;line-height:19px;color:#898f9c">&nbsp;&nbsp;&nbsp;</span></td></tr></tbody></table></td></tr><tr><td valign="middle"><a href="' +
      companyURL +
      notificationURL +
      '" style="color:#c3272e;text-decoration:none" target="_blank"><table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><tbody><tr><td style="border-collapse:collapse;border-radius:2px;text-align:center;display:block;border:solid 1px #c3272e;background:#c3272e;padding:7px 16px 11px 16px"><a href="' +
      companyURL +
      notificationURL +
      '" style="color:#c3272e;text-decoration:none;display:block" target="_blank"><center><font size="3"><span style="font-family:Helvetica Neue,Helvetica,Lucida Grande,tahoma,verdana,arial,sans-serif;white-space:nowrap;font-weight:bold;vertical-align:middle;color:#fff;font-size:14px;line-height:14px">Open</span></font></center></a></td></tr></tbody></table></a></td></tr></tbody></table></td></tr></tbody></table></td><td width="15" style="display:block;width:15px">&nbsp;&nbsp;&nbsp;</td></tr></tbody></table></td></tr></tbody></table></a> <br><br><br> <p><font face="Verdana" size="2">If you no longer wish to receive these emails you may <a href="' +
      unsubscribelink +
      '">Unsubscribe</a> at any time. </font></p>'
    );

    //
  };
};
