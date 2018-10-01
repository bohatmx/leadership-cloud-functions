const functions = require('firebase-functions');
var handleNotifications = require('./handle-notifications');
var userMails = new handleNotifications();

exports.testMails = functions.https.onRequest((req, res) => {
    var photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/photos%2FLPfb.jpg1529931262862?alt=media&token=f0328e8e-40f8-4a4b-a04f-a48a48a3574b";

    var journalUserName = "Colman Mwakio";
    let msgPlain = journalUserName+' posted a thought by Adrian Gore - CEO Discovery Group'
    msgPlain += '';
    msgPlain += 'Best Regards,';
    msgPlain += 'Global Leadership Platform.';

    var subject = '[TEST EMAIL]: Colman posted a new thought';

    var options = {
        "to": "cmwakio@gmail.com",
        "subject": subject,
        "msgTxt": msgPlain,
        "msgHTML": "",
        "photoURL":photoURL,
        "notificationMsg": journalUserName+' posted a thought by Adrian Gore - CEO Discovery Group',
        "userName": journalUserName,
        "notificationURL": 'filtered-thoughts/#/-LM8aVCL9jdQK580V9kr',
        "userID":"-Kwoqx98yZsUZhlJDWj7",
        "all":true,
        "companyID":"-KgsUcgfo7z1U9MXgd9i"
    }

    userMails.sendBatchMails(options);
    // userMails.testBatchEmails(options);
    // userMails.massMailer();
});