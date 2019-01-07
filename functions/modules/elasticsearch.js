const functions = require('firebase-functions');
const lodash = require('lodash');
const request = require('request-promise');
var elasticSearchConfig = functions.config().elasticsearch;

module.exports = function (){
    // new user created
    this.userCreated = function(data){
        // Get the new created document
        const userData = data;
        const userId = data.userID;
        const companyID = data.companyID;

        // Define the fields to index from the post
        const elasticUserIndexFields = [
            'uid',
            'userID',
            'firstName',
            'lastName',
            'email',
            'companyID',
            'companyName',
            'userType',
            'userDescription'
        ]

        console.log(data)

        // Define the search request endpointuser
        let elasticSearchUrl = elasticSearchConfig.url + `users/${companyID}/${userId}`
        const elasticSearchMethod = 'POST';

        const esUrl = elasticSearchUrl.split('\n')
        //  console.assert(elasticSearchUrl.replace(' ', '') == elasticSearchUrl)
        const esUrlClean = esUrl[0].replace('//e', '/e')
        elasticSearchUrl = esUrlClean + esUrl[1]

        console.log(elasticSearchUrl)

        const elasticUserSearchRequest = {
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
    this.userUpdated = function(data){
        
    }

    // new user created
    this.userDeleted = function(data){
        // Get the new created document
        const userData = data;
        const userId = data.userID;
        const companyID = data.companyID;

        // Define the fields to index from the post
        const elasticUserIndexFields = [
            'uid',
            'userID',
            'firstName',
            'lastName',
            'email',
            'companyID',
            'companyName',
            'userType',
            'userDescription'
        ]

        console.log(data)

        // Define the search request endpointuser
        let elasticSearchUrl = elasticSearchConfig.url + `users/${companyID}/${userId}`
        const elasticSearchMethod = 'DELETE';

        const esUrl = elasticSearchUrl.split('\n')
        //  console.assert(elasticSearchUrl.replace(' ', '') == elasticSearchUrl)
        const esUrlClean = esUrl[0].replace('//e', '/e')
        elasticSearchUrl = esUrlClean + esUrl[1]

        console.log(elasticSearchUrl)

        const elasticUserSearchRequest = {
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

}