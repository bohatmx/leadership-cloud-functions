const functions = require("firebase-functions");
var curl = require("curl");
let uu = require("url-unshort")();

exports.unshortenURL = functions.https.onRequest((req, res) => {
  uu.expand("https://bit.ly/2vMTDXl")
    .then(url => {
      //   if (url) {console.log(`Original url is: ${url}`)

      if (url.includes(".ted.com")) {
        curl.get(url, {}, function(err, response, body) {
          // console.log("response: ",response.headers);
          res.json("https://embed.ted.com" + response.request.uri.pathname);
        });
      }
      // no shortening service or an unknown one is used
      else console.log("This url can't be expanded");
    })
    .catch(err => console.log(err));

  //   var url = 'http://t.ted.com/qeOr9ss';
});
