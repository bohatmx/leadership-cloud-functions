const functions = require('firebase-functions');
const _ = require('lodash');
const request = require('request-promise');


const elasticSearchConfig = functions.config().elasticsearch;
// on create or update daily thoughts
exports.userSearch = functions.database.ref('/user-search/{searchId}').onCreate((snap, context) => {
    const search = snap.val();
    const searchId = context.params.searchId;

    const elasticSearchUrl = cleanUrl(elasticSearchConfig.url);

    // Request to elasticsearch service 
    const promise = request({
        method: 'GET',
        uri: elasticSearchUrl + 'users/_search',
        auth: { // Basic Auth
            username: elasticSearchConfig.username,
            password: elasticSearchConfig.password,
        },
        body: {
            query: {
                match_all: {
                    query: search.queryText,
                    fields: [
                        "email",
                        "lastName",
                        "firstName"
                    ]
                }
            }

        },
        json: true
    })

    return promise.then(response => console.log(response)).catch(err => console.log(err));

});

function cleanUrl(rawServiceUrl) {
    if (typeof rawServiceUrl !== "string" || rawServiceUrl.length === 0)
        return new Error("%s is empty or not a string");

    const esUrl = rawServiceUrl.split('\n')
    //  console.assert(elasticSearchUrl.replace(' ', '') == elasticSearchUrl)
    const esUrlClean = esUrl[0].replace('//e', '/e')
    const elasticSearchUrl = esUrlClean + esUrl[1]
    return elasticSearchUrl;
}