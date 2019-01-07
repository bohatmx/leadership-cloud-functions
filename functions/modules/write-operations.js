const functions = require('firebase-functions');
const newElasticSearch = require('./elasticsearch');

const elasticsearch = new newElasticSearch();

// on write operation request
exports.writeOperations = functions.database.ref('/writeOperations/{writeCategory}/{writeOperationsID}').onCreate((snap, context) => {

    // New user record to be indexed
    if(context.params.writeCategory === "newUserElastic"){
        console.log("newUserElastic")
        const writeOperationsObj = snap.val();
        var userData = writeOperationsObj.userData;

        console.log("before posting to elastic search: ", userData)

        var postaddres = elasticsearch.userCreated(userData);
    }

    // Delete user record from Elastic Search
    if(context.params.writeCategory === "deleteUserElastic"){
        console.log("deleteUserElastic")
        const writeOperationsObj = snap.val();
        var userData = writeOperationsObj.userData;

        console.log("before deleting from elastic search: ", userData)

        var postaddres = elasticsearch.userDeleted(userData);
    }
    
    return snap.ref.remove();
});