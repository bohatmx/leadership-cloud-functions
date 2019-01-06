const functions = require('firebase-functions');
var appAnalytics = require('./app-analytics');
const admin = require('firebase-admin');
var updateAppAnalytics = new appAnalytics();

// on create or update daily thoughts
exports.userClicks = functions.database.ref('/user-clicks/{dateRegistered}').onCreate((snap, context) => {
    const clickObj = snap.val();

    updateAppAnalytics.addclicks(clickObj);

    var clickType = clickObj.clickType;

    if(clickType == "posts"){
        var clickArea = clickObj.clickArea;
        var postType = clickObj.postType;
        var journalID = clickObj.journalID;

        // thoughts
        if((postType == "thoughts") || (postType == "Thought")){
            if(clickArea == "viewedUserProfile"){
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('profileclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 1: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 1: ', committed);
                    } else {
                        console.log('Transaction 1 committed');
                    }
                });
            }else if((clickArea == "tca-videos") || (clickArea == "tca-links") || (clickArea == "tca-podcasts") ){
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('attachmentsclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 2: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 2: ', committed);
                    } else {
                        console.log('Transaction 2 committed');
                    }
                });
            }else{
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('otherclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 3: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 3: ', committed);
                    } else {
                        console.log('Transaction 3 committed');
                    }
                });
            }
        }
        // articles
        else if((postType == "articles") || (postType == "Article") || (postType == "news")){
            if(clickArea == "viewedUserProfile"){
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('profileclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 4: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 4: ', committed);
                    } else {
                        console.log('Transaction 4 committed');
                    }
                });
            }else if(clickArea == "readArticle") {
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('readarticle');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 5: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 5: ', committed);
                    } else {
                        console.log('Transaction 5 committed');
                    }
                });
            }else if((clickArea == "tca-videos") || (clickArea == "tca-links") || (clickArea == "tca-podcasts") ){
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('attachmentsclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 6: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 6: ', committed);
                    } else {
                        console.log('Transaction 6 committed');
                    }
                });
            }else{
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('otherclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 7: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 7: ', committed);
                    } else {
                        console.log('Transaction 7 committed');
                    }
                });
            }
        }
        // podcasts
        else if((postType == "podcasts") || (postType == "voicemail") || (postType == "news") || (postType == "Podcast") || (postType == "Voicemail")){
            if(clickArea == "viewedUserProfile"){
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('profileclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 8: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 8: ', committed);
                    } else {
                        console.log('Transaction 8 committed');
                    }
                });
            }else if(clickArea == "listenedTo") {
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('listenedto');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 9: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 9: ', committed);
                    } else {
                        console.log('Transaction 9 committed');
                    }
                });
            }else{
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('otherclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 10: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 10: ', committed);
                    } else {
                        console.log('Transaction 10 committed');
                    }
                });
            }
        }
        // vides
        else if((postType == "Video") || (postType == "videos")){
            if(clickArea == "viewedUserProfile"){
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('profileclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 11: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 11: ', committed);
                    } else {
                        console.log('Transaction 11 committed');
                    }
                });
            }else if(clickArea == "viewed") {
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('viewed');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 12: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 12: ', committed);
                    } else {
                        console.log('Transaction 12 committed');
                    }
                });
            }else{
                let countCompany = admin.database().ref('posts-analytics').child(journalID).child('otherclicks');

                let companyCount = countCompany.transaction(function(current) {
                    return (current || 0) + 1;
                }, function(error, committed, snapshot) {
                    if (error) {
                        console.log('Transaction failed abnormally! 13: ', error);
                    } else if (!committed) {
                        console.log('Not Committed 13: ', committed);
                    } else {
                        console.log('Transaction 13 committed');
                    }
                });
            }
        }

    }
});
   