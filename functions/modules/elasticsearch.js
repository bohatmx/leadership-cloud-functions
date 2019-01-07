const functions = require('firebase-functions');
const _ = require('lodash');
const request = require('request-promise');


let elasticSearchConfig = functions.config().elasticsearch;

// exports.indexCarsToElastic = functions.database.ref('/cars/{carId}') // Daily 
//     .onWrite((change, context) => {
//         let carData = change.after.val();
//         let carId = context.params.carId;

//         console.log('Indexing car ', carId, carData);

//         // Fields to index
//         let elasticsearchFields = [
//             ',
//         ];

//         let elasticSearchUrl = elasticSearchConfig.url + 'cars/car/' + carId;
//         let elasticSearchMethod = carData ? 'POST' : 'DELETE';

//         let elasticsearchRequest = {
//             method: elasticSearchMethod,
//             uri: elasticSearchUrl,
//             auth: {
//                 username: elasticSearchConfig.username,
//                 password: elasticSearchConfig.password,
//             },
//             body: _.pick(carData, elasticsearchFields),
//             json: true
//         };

//         return request(elasticsearchRequest).then(response => {
//             console.log('Elasticsearch response', response);
//         }).catch(err => console.log(err))

//     });

/**
 *  Triggers indexing of all the new thoughts post 
 * 
 */
exports.OnThoughtPosted =
    functions.database.ref('/dailyThoughts/{dailyThoughtId}').onCreate((snapshot, context) => {

        // Get the new created document
        const dailyThoughtData = snapshot.val();
        const dailyThoughtId = context.params.postId;

        // Define the fields to index from the post
        const elasticPostIndexFields = [
            'title', // Description
            'subtitle', // Author 
            'dailyThoughtId',
            'journalUserName', // Posted User 
            'journalUserId', // 
            'userType'
        ];
        // Define the search request endpoint
        let elasticSearchUrl = elasticSearchConfig.url + '/posts/' + dailyThoughtId
        let elasticSearchMethod = dailyThoughtData ? 'POST' : 'DELETE';

        const elasticPostSearchRequest = {
            method: elasticSearchMethod,
            uri: elasticSearchUrl,
            auth: {
                username: elasticSearchConfig.username,
                password: elasticSearchConfig.password,
            },
            body: _.pick(dailyThoughtData, elasticPostIndexFields),
            json: true
        }


        // Return a promise with the results \ Change this to functions.https
        return request(elasticPostSearchRequest)
            .then(response => {
                console.log('Elasticsearch response :', response);
            }).catch(err => console.log(err))

    }) // end func   

// exports.OnVideoPosted =
//     functions.database.ref('/').onCreate((snapshot, context) => {

//     })

// exports.OnPodcastPosted =
//     functions.database.ref('/').onCreate((snapshot, context) => {

//     })

exports.OnUserChange =
    functions.database.ref('/users/{userId}').onWrite((change, context) => {
        // Get the new created document
        const userData = change.after.val();
        const userId = context.params.userId;

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
        console.log(userData)

        // Define the search request endpointuser
        let elasticSearchUrl = elasticSearchConfig.url + 'users/user/' + userId
        const elasticSearchMethod = userData ? 'POST' : 'DELETE';

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
            body: _.pick(userData, elasticUserIndexFields),
            json: true
        }


        // Return a promise with the results
        return request(elasticUserSearchRequest)
            .then(response => {
                console.log('Elasticsearch response :', response);
            })

    }) // end func   

// exports.getUserSearch = (queryText = 'andr', reqMethod = 'post') => {
//     // Request to elasticsearch service 
//     const promise = request({
//         method: reqMethod,
//         uri: elasticSearchConfig.url + '/users',
//         auth: { // Basic Auth
//             username: elasticSearchConfig.username,
//             password: elasticSearchConfig.password,
//         },
//         body: {

//             query: {
//                 multi_match: {
//                     query: queryText,
//                     fields: [
//                         "email",
//                         "lastName",
//                         "firstName"
//                     ]
//                 }
//             }

//         },
//         json: true
//     })

//     return promise.then(response => response).catch(err => err);
// } // end func


// exports.OnThoughtPosted =
//     functions.database.ref('/').onCreate((snapshot, context) => {

//     })