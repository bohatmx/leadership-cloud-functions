const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

const cors = require('cors')({
    origin: true
});

const MESSAGE = '142'
const app = express();

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {

    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        // console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
        //     'Make sure you authorize your request by providing the following HTTP header:',
        //     'Authorization: Bearer <Firebase ID Token>',
        //     'or by passing a "__session" cookie.');

        // res.status(403).send('');
        res.status(403).json({"code": "403", "status": "Unauthorized", "message": "You Are Unauthorized!"})
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    admin.auth().verifyIdToken(idToken).then(decodedIdToken => {
        req.user = decodedIdToken;
        next();

    }).catch(error => {
        res.status(403).json({"code": "403", "status": "Unauthorized", "message": "Error while verifying Firebase ID token: "+error.message})
        return;
    });
};

app.use(cors);

app.use('/',validateFirebaseIdToken);

// -------- include data modules --------------- //
var getData = require('./get-data');
var requestData = new getData();
var self = this;

// Generic routes to GET, POST, PUT, PATCH and DELETE data
app.route('/')
  .get(function (request, response) {
        var tblref = request.query.tblref;
        var tblcol = request.query.tblcol;
        var tblval = request.query.tblval;
        var limit = request.query.limit === undefined ? 10 : Number (request.query.limit);

        // response.json({"code": "400", "status": "Failure", "message": limit})
        // return;

        // if filtering data by column else fetch all
        if((tblcol != undefined) && (tblcol != null) ){

            if((tblref == undefined) || (tblref == null) || (tblval == undefined) || (tblval == null)){
                response.status(400).json({"code": "400", "status": "Failure", "message": "Invalid / Missing query parameters: tblref"})
                return;
            }
            else if((tblval == undefined) || (tblval == null)){
                response.status(400).json({"code": "400", "status": "Failure", "message": "Invalid / Missing query parameters: tblval"})
                return;
            }

            requestData.filtered(tblref, tblcol, tblval, limit, response);
        }else {
            // fetch all data
            if( (tblref != undefined) && (tblref != null) ){
                requestData.all(tblref, limit, response);
            }else{
                response.status(400).json({"code": "400", "status": "Failure", "message": "Invalid / Missing query parameters: tblref"})
                return;
            }
        }
        
  })
  .post(function (req, res) {
    res.send('POST API')
  })
  .put(function (req, res) {
    res.send('Update the book')
  })
  .patch(function (req, res) {
    res.send('Update the book')
  })
  .delete(function (req, res) {
    res.send('Update the book')
  })


app.use((req, res, next) => {
    next();
})

module.exports = app;