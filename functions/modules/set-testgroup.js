const functions = require('firebase-functions');
const admin = require('firebase-admin');

var testers = {
    "-LIssRpSF5aFd_twN5xO": true,
    "-Kwoqx98yZsUZhlJDWj7": true,
    "-LDZeN4IM3p_QmQBYQHJ": true,
    "-LGd_80yyY8GyUxEUW6y": true,
    "-LHIqagtbY5F9RknKXez": true,
    "-KyQV-eYp6RAhF7mZv55": true,
    "-LJnIEzwdDpatypSDmR_": true
}

exports.setTestGroup = functions.https.onRequest((req, res) => {
   
    console.log('======= Object.keys ==========');
    Object.keys(testers).map(e => {
        return admin.database().ref('users/'+e+'/following').on('child_added', function(snap) {
            var userRef = snap.key;
            var userSnap = snap.val();
         
            var isTester = testers[userRef];
        
            if(isTester == true){
                console.log("Tester found: ", userRef);
            }
            else{
                console.log("Not a tester: ", userRef);
                var removeUserData = {};
                removeUserData['users/'+e+'/following/'+userRef] = null;

                // Do a deep-path update
                admin.database().ref().update(removeUserData, function(error) {
                    if (error) {
                        console.log("Error deleting user data:", error);
                    }else{
                        // userRef.remove();
                        console.log("User deleted: ")
                    }
                });

            }

        });
    });
    
});