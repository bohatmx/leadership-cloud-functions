const functions = require('firebase-functions');
const admin = require('firebase-admin');

var async = require("async");
var appAnalytics = require('./app-analytics');
var updateAppAnalytics = new appAnalytics();

var executedcompany = {
    "-KgsUcgfo7z1U9MXgd9i":true,
    "-LEiZPT-C2PyLu_YLKNU":true
}

exports.updateAnalytics = functions.https.onRequest((req, res) => {

    const updateType = req.query.type;
// -KgsUcgfo7z1U9MXgd9i
// -L5y9MEiFJqfqfE0RJ4w
// -L7tBAMWWXVrLwgrBell
// -L7tCRKJdKRdhfDFYVjd

// -L7tDFeGuFSLAAnzHDqw
// -L7tEbNwW0sobxvNblWp
// -L7tF_L-gN1Q_-rCkdHP
// -L7tGRUv2x_nCzGsxEib
// -L9NkfovFoF4cWxLrobl
// -L9_LAH0uq64RZHmjoPM
// -LBPcsCl4Dp7BsYB8fjE
// -LBeyk4xY0FTKUSIQF_6
// -LCSPuXHI4sFtwSgsVIS
// -LDVbbRyIMhukVtTVQ0n
// -LDmZ-QuYRPb-cJVHSG8
// -LDmeUF4hh95SJjOb5AS
// -LDmhulqhKsKuXoDeAkk
// -LDmkv-XmSWqojScnQjK
// -LDuAxO2-B4j3pp0Y8Yh
// -LEOXNbmKTNT-ESo3525
// -LEOopkMyW0EZkeTyp1L
// -LEiZPT-C2PyLu_YLKNU
// -LFG_ob24QPa9wbsJLAe
// -LFWwJDGboULCmA0aC_9
// -LIPZbfRi__kUv5Qu9kI
// -LJwltp9pLLXUDc9iIeH
// -LLZVgHEPs4lh_TLmPdR.equalTo("-LEiZPT-C2PyLu_YLKNU")

    if(updateType == "thoughts"){
        return admin.database().ref('/dailyThoughts').orderByChild('companyID').once('value').then(function(snapshot) {
            var count = 0;
        
            snapshot.forEach(function(childSnapshot) {

                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
    
                var companyID = childData.companyID;
                var companyName = childData.companyName;

                if(!executedcompany[companyID]){

                     // get title and subtitle from thought object
                    var subtitle = childData.subtitle;
        
                    var journalUserID = childData.journalUserID;
                    var journalUserName = childData.journalUserName;

                    if(childData.dateScheduled != undefined){
                        var notificationDate = childData.dateScheduled;
                    }else if(childData.dateRegistered != undefined){
                        var notificationDate = childData.dateRegistered;
                    }else{
                        var notificationDate = Date.now();
                    }

                    var notificationItemID = childKey;
                    var photoURL = "";
        
                    if(childData.photoURL != undefined || childData.photoURL != ""){
                        photoURL = childData.photoURL;
                    }else{
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
                
                    if(photoURL == undefined || photoURL == ""){
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
        
                    var notificationData = {
                        notificationItemID: notificationItemID,
                        notificationType: 'thought',
                        notificationMsg: journalUserName+' posted a thought by '+subtitle,
                        journalUserID: journalUserID,
                        journalUserName: journalUserName,
                        photoURL: photoURL,
                        notificationDate: notificationDate,
                        companyID:companyID,
                        companyName:companyName
                    }
        
                    if((companyID != undefined) && (journalUserID != undefined)){
                        updateAppAnalytics.addposts(notificationData);
                        count++;
                        console.log("updated thought count: ", count, " key: ", childKey);
                    }else{
                        count++;
                        console.log("never updated thought count: ", count, " key: ", childKey);
                    }
                    
                }
                // end executed companies
    
                
            });
    
            return snapshot;
        });

    }else if(updateType == "articles"){
        return admin.database().ref('/news').once('value').then(function(snapshot) {
        
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
    
                var companyID = childData.companyID;
                var companyName = childData.companyName;
    
                // get title and subtitle from thought object
                var body = childData.title;
    
                var journalUserID = childData.journalUserID;
                var journalUserName = childData.journalUserName;
                if(childData.dateScheduled != undefined){
                    var notificationDate = childData.dateScheduled;
                }else if(childData.dateRegistered != undefined){
                    var notificationDate = childData.dateRegistered;
                }else{
                    var notificationDate = Date.now();
                }
                var notificationItemID = childKey;
                var photoURL = "";
    
                if(childData.photoURL != undefined || childData.photoURL != ""){
                    photoURL = childData.photoURL;
                }else{
                    photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                }
            
                if(photoURL == undefined || photoURL == ""){
                    photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                }
    
                var notificationData = {
                    notificationItemID: notificationItemID,
                    notificationType: 'article',
                    notificationMsg: journalUserName+' posted an article about: "'+body+'"',
                    journalUserID: journalUserID,
                    journalUserName: journalUserName,
                    photoURL: photoURL,
                    notificationDate: notificationDate,
                    companyID:companyID,
                    companyName:companyName
                }
                
    
                if((companyID != undefined) && (journalUserID != undefined)){
                    updateAppAnalytics.addposts(notificationData);
                }
            });
    
            return snapshot;
        });

    }else if(updateType == "podcasts"){
        return admin.database().ref('/podcasts').once('value').then(function(snapshot) {
        
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                // get title and subtitle from thought object
                var company_status = childData.company_status;

                if(company_status == "general_true"){
                    var title = childData.title;
                    var podcastDescription = childData.podcastDescription;

                    var journalUserID = childData.userID;
                    var journalUserName = childData.userName;
                    var companyID = childData.companyID;
                    var companyName = childData.companyName;
        
                    if(childData.dateScheduled != undefined){
                        var notificationDate = childData.dateScheduled;
                    }else if(childData.dateRegistered != undefined){
                        var notificationDate = childData.dateRegistered;
                    }else{
                        var notificationDate = Date.now();
                    }

                    var notificationItemID = childKey;
                    var photoURL = "";
        
                    if(childData.photoURL != undefined || childData.photoURL != ""){
                        photoURL = childData.photoURL;
                    }else{
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
                
                    if(photoURL == undefined || photoURL == ""){
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
        
                    var notificationData = {
                        notificationItemID: notificationItemID,
                        notificationType: 'podcast',
                        notificationMsg: journalUserName+' posted a '+podcastDescription.toLowerCase()+' about: "'+title+'"',
                        journalUserID: journalUserID,
                        journalUserName: journalUserName,
                        photoURL: photoURL,
                        notificationDate: notificationDate,
                        companyID:companyID,
                        companyName:companyName
                    }
        
                    if((companyID != undefined) && (journalUserID != undefined)){
                        updateAppAnalytics.addposts(notificationData);
                    }
                    
                }

            });
    
            return snapshot;
        });

    }else if(updateType == "videos"){
        return admin.database().ref('/videos').once('value').then(function(snapshot) {
        
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                // get title and subtitle from thought object
                var company_status = childData.company_status;

                // if(company_status == "general_true"){
                    var title = childData.title;

                    var journalUserID = childData.userID;
                    var journalUserName = childData.userName;
                    var companyID = childData.companyID;
                    var companyName = childData.companyName;
        
                    if(childData.dateScheduled != undefined){
                        var notificationDate = childData.dateScheduled;
                    }else if(childData.dateRegistered != undefined){
                        var notificationDate = childData.dateRegistered;
                    }else{
                        var notificationDate = Date.now();
                    }
                    var notificationItemID = childKey;
                    var photoURL = "";
        
                    if(childData.photoURL != undefined || childData.photoURL != ""){
                        photoURL = childData.photoURL;
                    }else{
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
                
                    if(photoURL == undefined || photoURL == ""){
                        photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
                    }
        
                    var notificationData = {
                        notificationItemID: notificationItemID,
                        notificationType: 'video',
                        notificationMsg: journalUserName+' posted a video about: "'+title+'"',
                        journalUserID: journalUserID,
                        journalUserName: journalUserName,
                        photoURL: photoURL,
                        notificationDate: notificationDate,
                        companyID:companyID,
                        companyName:companyName
                    }
        
                    if((companyID != undefined) && (journalUserID != undefined)){
                        updateAppAnalytics.addposts(notificationData);
                    }
                    
                // }

            });
    
            return snapshot;
        });

    }else if(updateType == "comments"){
        return admin.database().ref('/comments').once('value').then(function(snapshot) {
        
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var journalUserID = childData.journalUserID;
                var companyID = childData.companyID;
        
                if((companyID != undefined) && (journalUserID != undefined)){
                    updateAppAnalytics.addcomments(childData);
                }

            });
    
            return snapshot;
        });

    }else if(updateType == "tasks"){
        return admin.database().ref('/pldpNotifications').once('value').then(function(snapshot) {
        
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var journalUserID = childData.journalUserID;
                var companyID = childData.companyID;
        
                if((companyID != undefined) && (journalUserID != undefined)){
                    updateAppAnalytics.pldptasks(childData);
                }

            });
    
            return snapshot;
        });

    }else if(updateType == "userliked"){
        return admin.database().ref('/user-liked').orderByChild('companyID').once('value').then(function(snapshot) {
            // .equalTo("-LEiZPT-C2PyLu_YLKNU")
            var count = 0;
        
            snapshot.forEach(function(childSnapshot) {
                count++;
                console.log(count);
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var journalUserID = childData.journalUserID;
                var companyID = childData.companyID;

                if(!executedcompany[companyID]){
                    if((companyID != undefined) && (journalUserID != undefined)){
                        console.log("key: ", childKey);
                        updateAppAnalytics.addlikes(childData);
                    }
                }
        
                

            });
    
            return snapshot;
        });

    }else if(updateType == "likes"){
        // likes for dailyThoughts, news, podcasts, videos
        // likes for Thought, Article, Podcast, Video
        var ref = 'dailyThoughts'
        var posttype = "Thought"
        return admin.database().ref('/'+ref).once('value').then(function(snapshot) {
            var count = 0;
            
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                var likes = childData.likesData;
                var likesCount = childData.likesCount;

                // console.log("key: ", childKey);

                
                if(likes != undefined){
                    // updateAppAnalytics.addlikes(likeObj);

                    for (var x in likes) {
                        // console.log('likes: ', likes[x]);
                        var journalUserID = likes[x].journalUserID;
                        var companyID = likes[x].companyID;
                        var userPost = journalUserID+"_"+childKey;
                        var likeObj = likes[x];
                        
                        likeObj.userPost = userPost;
                        likeObj.postType = ref;

                        var clickdata = {
                            userID: likeObj.journalUserID,
                            userName: likeObj.journalUserName,
                            myPhoto: likeObj.photoURL,
                            myCompanyID: likeObj.companyID,
                            myCompanyName: likeObj.companyName,
                            dateRegistered: likeObj.likesDate,
                            postType: posttype,
                            journalID: childKey,
                            clickType:"posts",
                            clickArea:"like",
                            clickItem:"button"
                        }

                        if((companyID != undefined) && (journalUserID != undefined)){
                            console.log("userPost: ", userPost);
                            admin.database().ref('user-liked').child(userPost).set(likeObj)
                            // admin.database().ref('user-clicks').child(userPost).set(clickdata)
                            // updateAppAnalytics.addlikes(likeObj);
                        }
                    }
                }
                
            });
    
            return snapshot;
        });
    
    }else if(updateType == "removelikes"){
        // likes for dailyThoughts, news, podcasts, videos
        admin.database().ref('user-likes').set(null);

        res.send(true);

    }
    else if(updateType == "activeusers"){
        return admin.database().ref('/company-analytics').once('value').then(function(snapshot) {
        
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var monthactiveusers = childData['month-active-users'];
                var yearactiveusers = childData['year-active-users'];

                if(yearactiveusers != undefined){
                    for (var x in yearactiveusers) {
                        var len = Object.keys(yearactiveusers[x]).length;
                        console.log("company: ",childKey, " year: ", x, " users: ",len);

                        let countActiveUserCompany = admin.database().ref('company-analytics').child(childKey).child(x).child("activeusers").set(len);
                        
                    }
                }

                if(monthactiveusers != undefined){
                    for (var x in monthactiveusers){
                        var len = Object.keys(monthactiveusers[x]).length;
                        console.log("x: ", x," len: ", len, "company: ",childKey)

                        let countCompanyActiveUserYearMonth = admin.database().ref('company-analytics').child(childKey).child(x).child("activeusers").set(len);
                        
                    }
                }

            });
    
            return snapshot;
        });

    }else if(updateType == "reportadmin"){
        let countActiveUserCompany = admin.database().ref('users').child("-Kx8HDnAkFF5ErwaPBPg").child("reportadmin").set(true);
        console.log("done");
    }else if(updateType == "noofusers"){
        return admin.database().ref('/companies').once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                admin.database().ref('/user').orderByChild('companyID').equalTo(childKey).once('value').then(function(snap){
                    // http://localhost:5000/glp-test/us-central1/m08-updateAnalytics?type=noofusers
                    if(snap.val() == null){
                        var len = 0
                    }else{
                        var len = Object.keys(snap.val()).length;
                    }
                    
                    console.log("company: "+childKey+" users: "+len);
                    admin.database().ref('company-analytics').child(childKey).child('counts').child('noofusers').set(len);
                })
            });
    
            return snapshot;
        });

    }else if(updateType == "podcastowner"){
        return admin.database().ref('/podcasts').orderByChild("company_status").equalTo("general_true").once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var updateOwner = {};
                updateOwner['podcasts/'+childKey+'/postOwner'] = childData.userID;
                admin.database().ref().update(updateOwner).then(postsupdate => {
                    console.log('updateOwner podcasts');
                }).catch(posts_err => {
                    console.log('updateOwner podcasts error');
                })

                console.log("podcasts: ", childKey, " owner: ", childData.userID)
                
            });
    
            return snapshot;
        });

    }else if(updateType == "videoowner"){
        return admin.database().ref('/videos').orderByChild("company_status").equalTo("general_true").once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();

                var updateOwner = {};
                updateOwner['videos/'+childKey+'/postOwner'] = childData.userID;
                admin.database().ref().update(updateOwner).then(postsupdate => {
                    console.log('updateOwner videos');
                }).catch(posts_err => {
                    console.log('updateOwner videos error');
                })

                console.log("video: ", childKey, " owner: ", childData.userID)
                
            });
    
            return snapshot;
        });

    }else if(updateType == "monthlyUsersUpdate"){
        var startDate = '2018-01-31';
        var today = new Date;
        var lastDay = lastday(today.getFullYear(), today.getMonth());
        var endMonth = (today.getMonth()+1) < 10 ? '0'+(today.getMonth()+1) : (today.getMonth()+1);
        var endDate = [today.getFullYear(), endMonth, lastDay].join('-');

        var fulldates = [], parsedates = [];

        function dateRange(startDate, endDate) {
            var start      = startDate.split('-');
            var end        = endDate.split('-');

            var startYear  = parseInt(start[0]);
            var endYear    = parseInt(end[0]);
            var dates      = [];
          
            for(var i = startYear; i <= endYear; i++) {
              var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
              var startMon = i === startYear ? parseInt(start[1])-1 : 0;
              for(var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j+1) {
                var month = j+1;
                var displayMonth = month < 10 ? '0'+month : month;
                var endday = lastday(i, j);
                dates.push([i, displayMonth, endday].join('-'));

                var x = new Date([i, displayMonth, endday].join('-'));
                var d = Date.parse(x);
                parsedates.push(d);
              }
            }
            return dates;
        }

        function lastday(y, m){
            return  new Date(y, m +1, 0).getDate();
        }

        var fulldates = dateRange(startDate, endDate);
        var listofusers = [];
        var success = [];
        var failure = [];

        var usersupdate = admin.database().ref('/user').orderByChild("companyID").once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                
                var childData = childSnapshot.val();
                var userID = childData.userID;
                var companyID = childData.companyID;
                var dateRegistered = childData.dateRegistered;

                if((dateRegistered != undefined) && (companyID != undefined)){

                    for (var x in parsedates){
                        var endAt = parsedates[x];
            
                        var d = new Date(endAt);
                        var locale = "en-us", month = d.toLocaleString(locale, { month: "short" }),
                        year = d.getFullYear();

                        if(dateRegistered <= endAt){
                            var userObj = {
                                companyID: companyID,
                                userID: userID,
                                period: year+'-'+month 
                            }
    
                            console.log(userID+" registered on / before: "+year+" month: ", month+" company: "+companyID);

                            listofusers.push(userObj);
    
                        }
                    }

                }
            });

            if(listofusers && listofusers.length > 0){

                function callBatchMailer(task, callback) {
                    console.log(`processing ${task.userID}`);
                    // return callback();
    
                    let countItems = admin.database().ref('company-analytics').child(task.companyID).child(task.period).child('noofusers');
    
                    let currentCount = countItems.transaction(function(current) {
                        // return 0;
                        return (current || 0) + 1;
                    }, function(error, committed, snapshot) {
                        if (error) {
                            console.log('Transaction failed abnormally! '+task.companyID+': ', error);
                            failure.push(task.userID);
                            return callback();
                        } else if (!committed) {
                            console.log('Not Committed '+task.companyID+': ', committed);
                            failure.push(task.userID);
                            return callback();
                        } else {
                            console.log('Transaction '+task.companyID+' committed');
                            success.push(task.userID);
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
                q.push(listofusers, function(err) {
                    console.log('finished processing item');
                });

                console.log("list of users to update: ");
            }else{
                console.error("Length of users is less than zero: ");
            }

        });
        

    }else if(updateType == "upduser"){
        // Edcon Company ID: -LOs4iZh3Y9LSiNtpWlH
        // OneConnect Company ID: -LDVbbRyIMhukVtTVQ0n
        // Edcon Test Server ID: -LNUyClmWi7ezjSI5E2q

        var usersupdate = admin.database().ref('/users').orderByChild("companyID").equalTo('-LDVbbRyIMhukVtTVQ0n').once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
    
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                var userID = childData.userID;
                var uid = childData.uid;
                var companyID = childData.companyID;
                var companyID_userType = childData.companyID_userType;
                var userDescription = childData.userDescription;
                var userType = childData.userType;
                var updates = {};

                if(userType == 8){
                    updates["users/"+userID+"/companyID_userType"]=companyID+"_10";
                    updates["users/"+userID+"/userDescription"]="Corporate I-Leader";
                    updates["users/"+userID+"/userType"]=10;

                    updates["user/"+uid+"/companyID_userType"]=companyID+"_10";
                    updates["user/"+uid+"/userDescription"]="Corporate I-Leader";
                    updates["user/"+uid+"/userType"]=10;
    
                    var updateuser = admin.database().ref().update(updates).then(() =>{
                        return console.log("user updated: ",userID);
                    }).catch(posts_err => {
                        console.log('update error: ', posts_err);
                    });

                    // console.log("user: ", updates);
                }

            });

        });

    }else if(updateType == "usersnotloggedin"){
        var count = 0;
        admin.auth().listUsers(1000)
        .then(function(listUsersResult) {
                listUsersResult.users.forEach(function(userRecord) {
                    
                    console.log("count: ",count,"user: ", userRecord.toJSON().email," verified: ",userRecord.toJSON().emailVerified);
                    
                    // if(!userRecord.toJSON().emailVerified){
                    //     count++;
                    //     var uid = userRecord.toJSON().uid;

                    //     admin.auth().updateUser(uid, {
                    //         emailVerified: true
                    //     })
                    //     .then(function(userRecord) {
                    //         // See the UserRecord reference doc for the contents of userRecord.
                            
                    //         // console.log("Successfully updated user", userRecord.toJSON().email);
                    //     })
                    //     .catch(function(error) {
                    //         console.log("Error updating user:", error);
                    //     });
                    // }

                    count++;
                });
            })
            .catch(function(error) {
            console.log("Error listing users:", error);
        });
        // return admin.database().ref('/user').orderByChild("companyID").equalTo('-LEiZPT-C2PyLu_YLKNU').once('value').then(function(snapshot) {
            
            
        //     snapshot.forEach(function(childSnapshot) {
    
        //         var uid = childSnapshot.key;

        //         // admin.auth().getUser(uid)
        //         // .then(function(userRecord) {
        //         //     // See the UserRecord reference doc for the contents of userRecord.
        //         //     console.log("Successfully fetched user data:", userRecord.toJSON().email);
        //         // })
        //         // .catch(function(error) {
        //         //     console.log("Error fetching user data:", error);
        //         // });
        //         admin.auth().updateUser(uid, {
        //             emailVerified: true
        //         })
        //         .then(function(userRecord) {
        //             // See the UserRecord reference doc for the contents of userRecord.
        //             console.log("Successfully updated user", userRecord.toJSON().email);
        //         })
        //         .catch(function(error) {
        //             console.log("Error updating user:", error);
        //         });
        //         // var childData = childSnapshot.val();
        //         // var userID = childData.userID;
        //         // var email = childData.email;
        //         // var userName = childData.firstName+" "+childData.lastName;

        //         // admin.database().ref('user-lastlogin').orderByChild('uid').equalTo(uid).once('value').then(function(snap){
        //         //     var exists = snap.exists();
        //         //     if(!exists) console.log( userName,",",email, ",", exists);
        //         // })
                
        //     });
    
        //     return snapshot;
        // });

    }else if(updateType == "userRecord"){
        var uid = "9mpv4kuFNTZryzEv0LhKYpxqQBC3";

        // var uid = "srgiSWBqBjSnBlb3xxR5ua2IX9F3";
        // emailVerified: false
        // password: "Pass@1234"

        admin.auth().updateUser(uid, {
            emailVerified: true,
            password: "pass1234"
        })
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully updated user", userRecord.toJSON());
        })
        .catch(function(error) {
            console.log("Error updating user:", error);
        });
            
        // admin.auth().getUser(uid)
        // .then(function(userRecord) {
        //     // See the UserRecord reference doc for the contents of userRecord.
        //     console.log("Successfully fetched user data:", userRecord.toJSON());
        // })
        // .catch(function(error) {
        //     console.log("Error fetching user data:", error);
        // });

    }
    
});