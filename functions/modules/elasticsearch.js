const functions = require('firebase-functions');
const admin = require('firebase-admin');
const lodash = require('lodash');
const request = require('request-promise');
var elasticSearchConfig = functions.config().elasticsearch;

module.exports = function (){
    // new user created
    this.userCreated = function(data){
        // Get the new created document
        var userData = data;
        var userId = data.userID;
        var companyID = data.companyID;
        var companyIDIndex = "co"+companyID.toLowerCase();
        var searchableField = data.firstName+" "+data.lastName+" "+data.email

        userData.searchableField = searchableField;

        // Define the fields to index from the post
        var elasticUserIndexFields = [
            'uid',
            'userID',
            'firstName',
            'lastName',
            'email',
            'companyID',
            'companyName',
            'userType',
            'userDescription',
            'biography',
            'dateRegistered',
            'disabled',
            'photoURL',
            'searchableField'
        ]

        // Define the search request endpointuser
        let elasticSearchUrl = elasticSearchConfig.url + `${companyIDIndex}/users/${userId}`
        var elasticSearchMethod = 'POST';

        var esUrl = elasticSearchUrl.split('\n')
        //  console.assert(elasticSearchUrl.replace(' ', '') == elasticSearchUrl)
        var esUrlClean = esUrl[0].replace('//e', '/e')
        elasticSearchUrl = esUrlClean + esUrl[1]

        var elasticUserSearchRequest = {
            method: elasticSearchMethod,
            uri: elasticSearchUrl,
            auth: {
                username: elasticSearchConfig.username,
                password: elasticSearchConfig.password,
            },
            body: lodash.pick(userData, elasticUserIndexFields),
            json: true
        }

        // Return a promise with the results
        return request(elasticUserSearchRequest)
        .then(response => {
            return console.log('Elasticsearch response :', response);
        })
        
    }

    // user record updated
    this.userUpdated = function(uid){
        var getUserRecord = admin.database().ref('/user/'+uid).once('value').then(function(snapshot) {
            // Get the new updated document
            var userData = snapshot.val();
            console.log("userData: ", userData)
            var userId = userData.userID;
            var companyID = userData.companyID;
            var companyIDIndex = "co"+companyID.toLowerCase();
            var searchableField = userData.firstName+" "+userData.lastName+" "+userData.email

            userData.searchableField = searchableField;

            // Define the fields to index from the post
            var elasticUserIndexFields = [
                'uid',
                'userID',
                'firstName',
                'lastName',
                'email',
                'companyID',
                'companyName',
                'userType',
                'userDescription',
                'biography',
                'dateRegistered',
                'disabled',
                'photoURL',
                'searchableField'
            ]

            console.log("elasticUserIndexFields: ", elasticUserIndexFields)

            // Define the search request endpointuser
            let elasticSearchUrl = elasticSearchConfig.url + `${companyIDIndex}/users/${userId}`
            var elasticSearchMethod = 'POST';

            var esUrl = elasticSearchUrl.split('\n')
            //  console.assert(elasticSearchUrl.replace(' ', '') == elasticSearchUrl)
            var esUrlClean = esUrl[0].replace('//e', '/e')
            elasticSearchUrl = esUrlClean + esUrl[1]

            var elasticUserSearchRequest = {
                method: elasticSearchMethod,
                uri: elasticSearchUrl,
                auth: {
                    username: elasticSearchConfig.username,
                    password: elasticSearchConfig.password,
                },
                body: lodash.pick(userData, elasticUserIndexFields),
                json: true
            }

            // Return a promise with the results
            return request(elasticUserSearchRequest)
            .then(response => {
                return console.log('Elasticsearch response :', response);
            })

        });
        
    }

    // new user created
    this.userDeleted = function(data){
        // Get the new created document
        var userData = data;
        var userId = data.userID;
        var companyID = data.companyID;
        var companyIDIndex = "co"+companyID.toLowerCase();
        var searchableField = data.firstName+" "+data.lastName+" "+data.email

        userData.searchableField = searchableField;

        // Define the fields to index from the post
        var elasticUserIndexFields = [
            'uid',
            'userID',
            'firstName',
            'lastName',
            'email',
            'companyID',
            'companyName',
            'userType',
            'userDescription',
            'biography',
            'dateRegistered',
            'disabled',
            'photoURL',
            'searchableField'
        ]

        // Define the search request endpointuser
        let elasticSearchUrl = elasticSearchConfig.url + `${companyIDIndex}/users/${userId}`
        var elasticSearchMethod = 'DELETE';

        var esUrl = elasticSearchUrl.split('\n')
        //  console.assert(elasticSearchUrl.replace(' ', '') == elasticSearchUrl)
        var esUrlClean = esUrl[0].replace('//e', '/e')
        elasticSearchUrl = esUrlClean + esUrl[1]

        var elasticUserSearchRequest = {
            method: elasticSearchMethod,
            uri: elasticSearchUrl,
            auth: {
                username: elasticSearchConfig.username,
                password: elasticSearchConfig.password,
            },
            body: lodash.pick(userData, elasticUserIndexFields),
            json: true
        }

        // Return a promise with the results
        return request(elasticUserSearchRequest)
        .then(response => {
            return console.log('Elasticsearch delete response :', response);
        })
    }

    // new user created
    this.userSearch = function(data){
        // Search body
        bodyQuery = {
            "query": {
                "wildcard": {
                "searchableField": "*"+data.searchText+"*"
                }
            }
        }

        var companyIDIndex = "co"+data.companyID.toLowerCase();

        // Define the search request endpointuser
        let elasticSearchUrl = elasticSearchConfig.url + `${companyIDIndex}/users/_search`
        var elasticSearchMethod = 'POST';

        var esUrl = elasticSearchUrl.split('\n')
        var esUrlClean = esUrl[0].replace('//e', '/e')
        elasticSearchUrl = esUrlClean + esUrl[1]

        var elasticUserSearchRequest = {
            method: elasticSearchMethod,
            uri: elasticSearchUrl,
            auth: {
                username: elasticSearchConfig.username,
                password: elasticSearchConfig.password,
            },
            body: bodyQuery,
            json: true
        }

        // Return a promise with the results
        var searchres = request(elasticUserSearchRequest)
        .then(response => {
            var hits = response['hits'];

            if(hits.total > 0){
                var users = hits['hits'];
                
                for (var x in users) {
                    var user = users[x];
                    var updates = {};
                    var useruid = user._source.uid
                    
                    updates["searchResults/users/"+data.uid+"/"+useruid]=user._source;
    
                    admin.database().ref().update(updates).then(() =>{
                        console.log("Update successful uid: "+useruid);
                    }).catch(posts_err => {
                        console.error("Update Error uid: "+useruid);
                    })

                    console.log("user: ", user._source);
                }
            }
            

            return console.log('Search response:', hits);
        })

        return true;
    }

}
