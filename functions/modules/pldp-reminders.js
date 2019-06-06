const functions = require("firebase-functions");
const admin = require("firebase-admin");

var handleNotifications = require("./handle-notifications");
var userToken = new handleNotifications();

exports.sendUserReminders = functions.https.onRequest((req, res) => {
  sendPLDPReminders();

  // res.send(status);
});

function sendPLDPReminders() {
  const reminders_res = getDueUnsentPLDPReminders();

  reminders_res
    .then(snap => {
      for (let rems of snap) {
        let userName = rems.journalUserName;
        let msg = rems.moveAction + ": " + rems.title;
        let notificationDate = Date.now();
        var notificationFequency = rems.reminderFrequency;
        var myPLDPID = rems.myPLDPID;
        var moveAction = rems.moveAction;
        moveAction = moveAction.toLowerCase();
        var notificationID = rems.notificationID;
        var reminderDate = rems.reminderDate;
        var stringReminderDate = rems.stringReminderDate;
        var reminderStatus = rems.reminderStatus;
        var journalUserID = rems.journalUserID;
        var title = rems.title;
        var photoURL = rems.photoURL;
        var companyID = rems.companyID;
        var companyName = rems.companyName;

        console.log("rems photo: ", rems.photoURL);

        if (photoURL == undefined)
          photoURL =
            "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";

        console.log("photoURL: ", photoURL);

        var notificationData = {
          notificationItemID: notificationID,
          notificationType: "pldpreminder",
          notificationMsg: 'You have a PLDP reminder about: "' + title + '"',
          journalUserID: journalUserID,
          journalUserName: userName,
          photoURL: photoURL,
          notificationDate: notificationDate,
          seen: false,
          opened: false,
          companyID: companyID,
          companyName: companyName
        };

        var companyURL = userToken.getCompanyURL(companyID);
        var pldpUrl = userToken.getPldpUrl(companyID);

        console.log("user: ", journalUserID);
        let payload = {
          title: "Leadership Platform - MyPLD Notification",
          body: msg,
          icon: "/images/manifest/icon-48x48.png",
          sound: "default",
          badge: "1",
          click_action: companyURL + pldpUrl
        };

        let device_tokens = admin
          .database()
          .ref("user")
          .orderByChild("userID")
          .equalTo(journalUserID)
          .once("value");

        device_tokens
          .then(snap => {
            console.log("fetch device tokens");

            snap.forEach(function(childSnapshot) {
              console.log("gotten device tokens");

              var childKey = childSnapshot.key;
              var childData = childSnapshot.val();

              console.log(childData);

              var notification_key = childData.notification_key;
              var email = childData.email;
              var receivePLDPEmails = childData.receivePLDPEmails;
              var uid = childKey;

              if (receivePLDPEmails == undefined) {
                receivePLDPEmails = true;
              }

              if (notification_key == undefined) {
                console.log("undefined key for user: ", journalUserID);
              } else {
                var msg = {
                  notification_key: notification_key,
                  payload: payload
                };
                console.log("send fcm: ", msg);
                userToken.send(msg);
              }

              // Send email notification
              if (email == undefined) {
                console.log("undefined email for user: ", rems.journalUserID);
              } else {
                // If user subscribed to PLDP emails
                if (receivePLDPEmails == true) {
                  // create email body
                  let msgHTML =
                    "<b>Dear " + rems.journalUserName + ",</b><br><br>";
                  msgHTML +=
                    "You have a new PLDP reminder about: " +
                    rems.title +
                    "<br><br>";
                  msgHTML += "<br>";
                  msgHTML += "<b>Best Regards,</b> <br>";
                  msgHTML += "<b>Global Leadership Platform.</b><br>";

                  let msgPlain = "Dear " + rems.journalUserName + ",";
                  msgPlain +=
                    "You have a new PLDP reminder about: " + rems.title;
                  msgPlain += "";
                  msgPlain += "Best Regards,";
                  msgPlain += "Global Leadership Platform.";

                  var subject = "PLDP Reminder - Global Leadership Platform";

                  var options = {
                    to: email,
                    subject: subject,
                    msgTxt: msgPlain,
                    msgHTML: msgHTML,
                    photoURL: photoURL,
                    notificationMsg:
                      "You have a new PLDP reminder about: " + rems.title,
                    userName: userName,
                    notificationURL: pldpUrl,
                    companyURL: companyURL
                  };
                  console.log("send email notify: ", options);

                  var link =
                    "email=" +
                    email +
                    "&type=pldp&action=" +
                    uid +
                    "&notification=" +
                    journalUserID;

                  userToken.sendNodeEmail(options, link);
                }
              }
            });
          })
          .catch(err => {
            console.log("Tokens Error: ", err);
          });

        var newNotificationID = admin
          .database()
          .ref()
          .child("users/" + rems.journalUserID + "/pldpnotifications")
          .push().key;
        notificationData.newNotificationID = newNotificationID;

        // Write the new notification's data
        var updates = {};
        updates[
          "users/" +
            rems.journalUserID +
            "/pldpnotifications/" +
            newNotificationID
        ] = notificationData;
        admin
          .database()
          .ref()
          .update(updates)
          .then(notify_res => {
            console.log("Write the new notifications data");
          })
          .catch(notify_err => {
            console.log("notify_err");
          });

        // Set reminder Status
        reminderStatus = "Sent";

        // reset notification per settings
        if (notificationFequency !== "Does not repeat") {
          var d = new Date(reminderDate);
          // set new dates according to frequency
          if (notificationFequency === "Hourly") d.setHours(d.getHours() + 1);
          if (notificationFequency === "Daily") d.setDate(d.getDate() + 1);
          if (notificationFequency === "Weekly") d.setDate(d.getDate() + 7);
          if (notificationFequency === "Monthly") d.setMonth(d.getMonth() + 1);
          if (notificationFequency === "Yearly")
            d.setFullYear(d.getFullYear() + 1);

          reminderDate = Date.parse(d);
          stringReminderDate = formatDate(reminderDate);
          reminderStatus = "Unsent";
        }
        //End reset notification per settings

        // Update the notification reminder
        var notificationUpdates = {};
        notificationUpdates[
          "pldpNotifications/" + notificationID + "/reminderDate"
        ] = reminderDate;
        notificationUpdates[
          "pldpNotifications/" + notificationID + "/stringReminderDate"
        ] = stringReminderDate;
        notificationUpdates[
          "pldpNotifications/" + notificationID + "/reminderStatus"
        ] = reminderStatus;

        if (
          moveAction == "direction" ||
          moveAction == "motivation" ||
          moveAction == "structure"
        ) {
          // Update the pldp's notification reminder
          notificationUpdates[
            "myPLDP/" + moveAction + "/" + myPLDPID + "/reminderDate"
          ] = reminderDate;
          notificationUpdates[
            "myPLDP/" + moveAction + "/" + myPLDPID + "/stringReminderDate"
          ] = stringReminderDate;
          notificationUpdates[
            "myPLDP/" + moveAction + "/" + myPLDPID + "/reminderStatus"
          ] = reminderStatus;
        } else {
          if (rems.journalUserID != undefined) {
            notificationUpdates[
              "pldp-tasks/" +
                rems.journalUserID +
                "/" +
                myPLDPID +
                "/reminderDate"
            ] = reminderDate;
            notificationUpdates[
              "pldp-tasks/" +
                rems.journalUserID +
                "/" +
                myPLDPID +
                "/stringReminderDate"
            ] = stringReminderDate;
            notificationUpdates[
              "pldp-tasks/" +
                rems.journalUserID +
                "/" +
                myPLDPID +
                "/reminderStatus"
            ] = reminderStatus;
          }
        }

        admin
          .database()
          .ref()
          .update(notificationUpdates)
          .then(notificationupdates_res => {
            console.log("update pldp notification reminder 1");
          })
          .catch(notificationupdates_err => {
            console.log("notificationupdates_err");
          });
      }
      // console.log('snap out',snap);
    })
    .catch(error => {
      console.log("reminders_res error", error);
      return false;
    });

  console.log("Running PLDP Reminders");

  return true;
}

function getDueUnsentPLDPReminders() {
  var status = "Unsent";
  var d = Date.now();
  var e = new Date(d);
  e.setSeconds(0, 0);
  var newDate = Date.parse(e);

  var fiveMinutesAgo = newDate - 300000;
  var reminders = [];

  let dbRef = admin
    .database()
    .ref("/pldpNotifications")
    .orderByChild("reminderStatus")
    .equalTo(status)
    .once("value");

  const reminders_prom = dbRef.then(snap => {
    snap.forEach(datav => {
      var send_reminder = datav.val();
      var reminderdate = send_reminder.reminderDate;
      var journalUserID = send_reminder.journalUserID;
      var journalUserName = send_reminder.journalUserName;

      // console.log("PLDP for : ",journalUserName);
      if (reminderdate >= fiveMinutesAgo && reminderdate <= newDate) {
        console.log(journalUserName + " push to reminders");
        // console.log("reminderdate: ", reminderdate);
        // console.log("newDate: ", newDate);
        // console.log("fiveMinutesAgo: ", fiveMinutesAgo);
        reminders.push(send_reminder);
      } else {
        console.log("nothing to push to reminders");
      }
    });

    return reminders;
  });

  return reminders_prom;
}

//custom date functions
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hours = "" + d.getHours(),
    minutes = "" + d.getMinutes(),
    seconds = "" + d.getSeconds(),
    milliseconds = "" + d.getMilliseconds();

  var today = new Date(),
    thisYear = today.getFullYear();

  // get month name
  var monthName = getDayMonthStr(d.getMonth(), "month", false);

  // add preceding zeros where needed
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hours.length < 2) hours = "0" + hours;
  if (minutes.length < 2) minutes = "0" + minutes;
  if (seconds.length < 2) seconds = "0" + seconds;
  if (milliseconds.length < 2) milliseconds = "0" + milliseconds;

  // format reminder date
  if (thisYear === year) {
    var reminderDate = monthName + " " + day + ", " + hours + ":" + minutes;
  } else {
    var reminderDate =
      monthName + " " + day + ", " + year + ", " + hours + ":" + minutes;
  }

  return reminderDate;
}

function getDayMonthStr(val, dateParam, long) {
  // days
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  var daysShort = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  // Months
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  if (dateParam === "day" && long === true) {
    // return day in long format
    return days[val];
  } else if (dateParam === "day" && long === false) {
    // return days in short
    return daysShort[val];
  }
  if (dateParam === "month" && long === true) {
    // return month in long format
    return monthNames[val];
  } else if (dateParam === "month" && long === false) {
    // return month in short
    return monthNamesShort[val];
  }
}
