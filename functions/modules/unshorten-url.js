const functions = require('firebase-functions');
var curl = require('curl');

exports.unshortenURL = functions.https.onRequest((req, res) => {

    var url = 'http://t.ted.com/qeOr9ss';

    if(url.includes('.ted.com')){

        curl.get(url, {}, function(err, response, body) {
            // console.log("response: ",response.headers);
            res.json("https://embed.ted.com"+response.request.uri.pathname);
        });
    
    }
})
 
