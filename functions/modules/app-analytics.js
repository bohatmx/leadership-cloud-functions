const functions = require('firebase-functions');
const admin = require('firebase-admin');

module.exports = function (){
    var that = this;

    // ===============  Add Items =====================/
    // add posts
    this.addposts = function(options){
        var updates = {};
        updates['/company-analytics/' + options.companyID + '/' + options.notificationType+'s/'+options.notificationItemID] = options;
        // updates['/users-analytics/' + options.companyID + '/' + options.journalUserID + '/'+ options.notificationType+'s/'+options.notificationItemID] = options;
        // updates['/posts-analytics/' + options.notificationType+'s/'+options.notificationItemID] = options;

        admin.database().ref().update(updates).then(update_res =>{
            console.log('Success updating posts analytics ');
        }).catch(error =>{
            console.log('Error updating posts analytics ');
        })

        // Add count to company analytics
        let countCompany = admin.database().ref('company-analytics').child(options.companyID).child('counts').child(options.notificationType+'s');

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
            console.log("Trans data 1: ");
        });

        // // Add count to user analytics
        // let countUser = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child(options.notificationType+'s');

        // let userCount = countUser.transaction(function(current) {
        //     return (current || 0) + 1;
        // });
        
        // // Add total user counts
        // let countUserTotal = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('total');

        // let userCountTotal = countUserTotal.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        // // Add count to posts analytics
        // let countPosts = admin.database().ref('posts-analytics').child('counts').child(options.notificationType+'s');

        // let postsCount = countPosts.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        if(options.journalUserID != undefined && options.journalUserName){
            var photoURL = "";
            if(options.photoURL != undefined || options.photoURL != ""){
                photoURL = options.photoURL;
            }else{
                photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
            }

            if(photoURL == undefined){
                photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
            }

            var user = {
                journalUserID: options.journalUserID,
                journalUserName: options.journalUserName,
                photoURL:photoURL
            }

            this.consolidate(options.notificationDate, options.notificationType+'s', user, options.companyID)

        }

        console.log('Finished running add posts analytics function.');

        return true
    }

    // add comments
    this.addcomments = function(options){
        // Add count to company analytics
        let countCompany = admin.database().ref('company-analytics').child(options.companyID).child('counts').child('comments');

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
            console.log("Trans data 2: ");
        });

        // // Add count to user analytics
        // let countUser = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('comments');

        // let userCount = countUser.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        // // Add total user counts
        // let countUserTotal = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('total');

        // let userCountTotal = countUserTotal.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        var photoURL = "";
        if(options.photoURL != undefined || options.photoURL != ""){
            photoURL = options.photoURL;
        }else{
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        if(photoURL == undefined){
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        var user = {
            journalUserID: options.journalUserID,
            journalUserName: options.journalUserName,
            photoURL:photoURL
        }

        this.consolidate(options.date, "comments", user, options.companyID)

        console.log('Finished running add comments analytics function.');

        return true
    }
    // add pldp tasks
    this.pldptasks = function(options){
        // Add count to company analytics
        let countCompany = admin.database().ref('company-analytics').child(options.companyID).child('counts').child('tasks');

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
            console.log("Trans data 3: ");
        });

        // // Add count to user analytics
        // let countUser = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('tasks');

        // let userCount = countUser.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        // // Add total user counts
        // let countUserTotal = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('total');

        // let userCountTotal = countUserTotal.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        var photoURL = "";
        if(options.photoURL != undefined || options.photoURL != ""){
            photoURL = options.photoURL;
        }else{
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        if(photoURL == undefined){
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        var user = {
            journalUserID: options.journalUserID,
            journalUserName: options.journalUserName,
            photoURL:photoURL
        }

        this.consolidate(options.dateRegistered, "tasks", user, options.companyID)

        console.log('Finished running add pldp tasks analytics function.');

        return true
    }

    // add likes
    this.addlikes = function(options){
        // Add count to company analytics
        let countCompany = admin.database().ref('company-analytics').child(options.companyID).child('counts').child('likes');

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
            console.log("Trans data 4: ");
        });

        // // Add count to user analytics
        // let countUser = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('likes');

        // let userCount = countUser.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        // // Add total user counts
        // let countUserTotal = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child('total');

        // let userCountTotal = countUserTotal.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        var photoURL = "";
        if(options.photoURL != undefined || options.photoURL != ""){
            photoURL = options.photoURL;
        }else{
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        if(photoURL == undefined){
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        var user = {
            journalUserID: options.journalUserID,
            journalUserName: options.journalUserName,
            photoURL:photoURL
        }

        this.consolidate(options.likesDate, "likes", user, options.companyID)

        console.log('Finished running add likes analytics function.');

        return true
    }

    // add clicks
    this.addclicks = function(options){
        // Add count to company analytics
        let countCompany = admin.database().ref('company-analytics').child(options.myCompanyID).child('counts').child('clicks');

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
            console.log("Trans data 5: ");
        });

        // // Add count to user analytics
        // let countUser = admin.database().ref('users-analytics').child(options.myCompanyID).child(options.userID).child('counts').child('clicks');

        // let userCount = countUser.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        // // Add total user counts
        // let countUserTotal = admin.database().ref('users-analytics').child(options.myCompanyID).child(options.userID).child('counts').child('total');

        // let userCountTotal = countUserTotal.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        var photoURL = "";
        if(options.myPhoto != undefined || options.myPhoto != ""){
            photoURL = options.myPhoto;
        }else{
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        if(photoURL == undefined){
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        var user = {
            journalUserID: options.userID,
            journalUserName: options.userName,
            photoURL:photoURL
        }

        this.consolidate(options.dateRegistered, "clicks", user, options.myCompanyID)

        console.log('Finished running add likes analytics function.');

        return true
    }

    // consolidate date
    this.consolidate = function(date, type, user, company){
        var objDate = new Date(date),
        locale = "en-us",
        month = objDate.toLocaleString(locale, { month: "short" }),
        year = objDate.getFullYear(),
        day = objDate.getDate() < 10 ? '0'+objDate.getDate() : objDate.getDate();

        // get user details
        var journalUserID = user.journalUserID;
        var journalUserName = user.journalUserName;
        var photoURL = "";
        
        if(user.photoURL != undefined || user.photoURL != ""){
            photoURL = user.photoURL;
        }else{
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        if(photoURL == undefined){
            photoURL = "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
        }

        // set company data - Year
        let countCompany = admin.database().ref('company-analytics').child(company).child(year).child(type);
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
            console.log("Trans data 6: ");
        });
        // // set company views and totals for the year
        // let viewsYearCompany = admin.database().ref('company-analytics').child(company).child(year).child("views");
        // let companyViewsYearCount = viewsYearCompany.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        let totalYearCompany = admin.database().ref('company-analytics').child(company).child(year).child("total");
        let companyTotalYearCount = totalYearCompany.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 7: ', error);
            } else if (!committed) {
                console.log('Not Committed 7: ', committed);
            } else {
                console.log('Transaction 7 committed');
            }
            console.log("Trans data 7: ");
        });


        // set company year month transactions
        let transYearCompany = admin.database().ref('company-analytics').child(company).child(year).child("transactions").child(month);
        let companyTransYearCount = transYearCompany.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 8: ', error);
            } else if (!committed) {
                console.log('Not Committed 8: ', committed);
            } else {
                console.log('Transaction 8 committed');
            }
            console.log("Trans data 8: ");
        });


        // set company data - Year, Month
        let countCompanyYearMonth = admin.database().ref('company-analytics').child(company).child(year+"-"+month).child(type);
        let companyYearMonthCount = countCompanyYearMonth.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 9: ', error);
            } else if (!committed) {
                console.log('Not Committed 9: ', committed);
            } else {
                console.log('Transaction 9 committed');
            }
            console.log("Trans data 9: ");
        });

        // // set company views and totals for the year
        // let viewsYearMonthCompany = admin.database().ref('company-analytics').child(company).child(year+"-"+month).child("views");
        // let companyViewsYearMonthCount = viewsYearMonthCompany.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        let totalYearMonthCompany = admin.database().ref('company-analytics').child(company).child(year+"-"+month).child("total");
        let companyTotalYearMonthCount = totalYearMonthCompany.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 10: ', error);
            } else if (!committed) {
                console.log('Not Committed 10: ', committed);
            } else {
                console.log('Transaction 10 committed');
            }
            console.log("Trans data 10: ");
        });

        let countUserCompany = admin.database().ref('company-analytics').child(company).child('year-active-users').child(year).child(journalUserID).child(type);
        let companyUserCount = countUserCompany.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 11: ', error);
            } else if (!committed) {
                console.log('Not Committed 11: ', committed);
            } else {
                console.log('Transaction 11 committed');
            }
            console.log("Trans data 11: ");
        });

        // // set active user views and totals for the year
        // let viewsUsersYearCompany = admin.database().ref('company-analytics').child(company).child('year-active-users').child(year).child(journalUserID).child("views");
        // let companyViewsUsersYearCount = viewsUsersYearCompany.transaction(function(current) {
        //     return (current || 0) + 1;
        // });

        let totalUserYearCompany = admin.database().ref('company-analytics').child(company).child('year-active-users').child(year).child(journalUserID).child("total");
        let companyTotalUserYearCount = totalUserYearCompany.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 12: ', error);
            } else if (!committed) {
                console.log('Not Committed 12: ', committed);
            } else {
                console.log('Transaction 12 committed');
            }
            console.log("Trans data 12: ");
        });

        let countCompanyUserYearMonth = admin.database().ref('company-analytics').child(company).child('month-active-users').child(year+"-"+month).child(journalUserID).child(type);

        let companyUserYearMonthCount = countCompanyUserYearMonth.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 13: ', error);
            } else if (!committed) {
                console.log('Not Committed 13: ', committed);
            } else {
                console.log('Transaction 13 committed');
            }
            console.log("Trans data 13: ");
        });

        // // set active user views and totals for the year, month
        // let viewsUserYearCompany = admin.database().ref('company-analytics').child(company).child('month-active-users').child(year+"-"+month).child(journalUserID).child("views");
        // let companyUserViewsYearCount = viewsUserYearCompany.transaction(function(current) {
        //     return (current || 0) + 1;
        // });
        
        let totalActiveUserYearCompany = admin.database().ref('company-analytics').child(company).child('month-active-users').child(year+"-"+month).child(journalUserID).child("total");
        let companyTotalActiveUserYearCount = totalActiveUserYearCompany.transaction(function(current) {
            return (current || 0) + 1;
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 14: ', error);
            } else if (!committed) {
                console.log('Not Committed 14: ', committed);
            } else {
                console.log('Transaction 14 committed');
            }
            console.log("Trans data 14: ");
        });


        // update user data
        var updates = {};
        updates['/company-analytics/' + company + '/year-active-users/' +year+'/'+journalUserID+'/data'] = {journalUserID:journalUserID,journalUserName:journalUserName,photoURL:photoURL};
        updates['/company-analytics/' + company + '/month-active-users/' +year+"-"+month+'/'+journalUserID+'/data'] = {journalUserID:journalUserID,journalUserName:journalUserName,photoURL:photoURL};

        admin.database().ref().update(updates).then(update_res =>{
            console.log('Success updating posts analytics ');
        }).catch(error =>{
            console.log('Error updating posts analytics ');
        })

    }

    // ===============  Remove Items =====================/

    // remove posts
    this.removeposts = function(options){
        var updates = {};
        updates['/company-analytics/' + options.companyID + '/' + options.notificationType+'s/'+options.notificationItemID] = null;
        updates['/users-analytics/' + options.companyID + '/' + options.journalUserID + '/'+ options.notificationType+'s/'+options.notificationItemID] = null;
        updates['/posts-analytics/' + options.notificationType+'s/'+options.notificationItemID] = null;

        admin.database().ref().update(updates).then(update_res =>{
            console.log('Success removing posts analytics ');
        }).catch(error =>{
            console.log('Error removing posts analytics ');
        })

        // Add count to company analytics
        let countCompany = admin.database().ref('company-analytics').child(options.companyID).child('counts').child(options.notificationType+'s');

        let companyCount = countCompany.transaction(function(current) {
            if(current == 0){
                return current
            }else{
                return (current || 0) - 1;
            }
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 15: ', error);
            } else if (!committed) {
                console.log('Not Committed 15: ', committed);
            } else {
                console.log('Transaction 15 committed');
            }
            console.log("Trans data 15: ");
        });

        // Add count to user analytics
        let countUser = admin.database().ref('users-analytics').child(options.companyID).child(options.journalUserID).child('counts').child(options.notificationType+'s');

        let userCount = countUser.transaction(function(current) {
            if(current == 0){
                return current
            }else{
                return (current || 0) - 1;
            }
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 16: ', error);
            } else if (!committed) {
                console.log('Not Committed 16: ', committed);
            } else {
                console.log('Transaction 16 committed');
            }
            console.log("Trans data 16: ");
        });

        // Add count to posts analytics
        let countPosts = admin.database().ref('posts-analytics').child('counts').child(options.notificationType+'s');

        let postsCount = countPosts.transaction(function(current) {
            if(current == 0){
                return current
            }else{
                return (current || 0) - 1;
            }
        }, function(error, committed, snapshot) {
            if (error) {
                console.log('Transaction failed abnormally! 17: ', error);
            } else if (!committed) {
                console.log('Not Committed 17: ', committed);
            } else {
                console.log('Transaction 17 committed');
            }
            console.log("Trans data 17: ");
        });

        console.log('Finished running remove posts analytics function.');

        return true
        
    }

    

}