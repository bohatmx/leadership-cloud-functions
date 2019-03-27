const functions = require('firebase-functions');
const admin = require('firebase-admin');
var express = require('express');
const graphqlServer = require('../graphql/schema');
var cors = require('cors')({
	origin: true,
	allowedHeaders: [ 'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization' ],
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	optionsSuccessStatus: 200
});

var app = express();

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
const validateFirebaseIdToken = (req, res, next) => {
	if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
		res.status(403).json({
			code: '403',
			status: 'Unauthorized',
			message: 'You Are Unauthorized!'
		});
		return;
	}

	let idToken;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		idToken = req.headers.authorization.split('Bearer ')[1];
	}

	admin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedIdToken) => {
			req.user = decodedIdToken;
			next();
		})
		.catch((error) => {
			res.status(403).json({
				code: '403',
				status: 'Unauthorized',
				message: 'Error while verifying Firebase ID token: ' + error.message
			});
			return;
		});
};

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
graphqlServer.applyMiddleware({ app });
// app.use('/',validateFirebaseIdToken);

// -------- include data modules --------------- //
const config = require('./config');
var getData = require('./get-data');
var postData = require('./post-data');
var patchData = require('./update-data');
var delData = require('./delete-data');
var requestData = new getData();
var newPostData = new postData();
var updateData = new patchData();
var deleteData = new delData();

// Generic routes to GET, POST data
app
	.route('/:name')
	.get(function(request, response) {
		if (request.params.name === 'companyanalytics') {
			var tblref,
				companyID,
				param1,
				param2 = '';
			tblref = config.endpoints[request.params.name];

			companyID = request.query.companyID;
			param1 = request.query.param1 || '';
			param2 = request.query.param2 || '';

			if (tblref == undefined || tblref == null) {
				response.status(400).json({
					code: '400',
					status: 'Failure',
					message: 'Invalid / Missing endpoint'
				});
				return;
			} else if (companyID == undefined || companyID == null || companyID.trim() == '') {
				response.status(400).json({
					code: '400',
					status: 'Failure',
					message: 'Invalid / Missing id'
				});
				return;
			}

			var genericPath = tblref.trim() + '/' + companyID.trim() + '/' + param1.trim() + '/' + param2.trim();

			requestData.generic(genericPath, response);
		} else {
			var tblref = '';
			if (request.params.name === 'users') tblref = 'user';
			else tblref = config.endpoints[request.params.name];

			var tblcol = request.query.tblcol;
			var tblval = request.query.tblval;
			var limit = request.query.limit === undefined ? 10 : Number(request.query.limit);

			// if filtering data by column else fetch all
			if (tblcol != undefined && tblcol != null) {
				if (tblref == undefined || tblref == null || tblval == undefined || tblval == null) {
					response.status(400).json({
						code: '400',
						status: 'Failure',
						message: 'Invalid / Missing query parameters: tblref'
					});
					return;
				} else if (tblval == undefined || tblval == null) {
					response.status(400).json({
						code: '400',
						status: 'Failure',
						message: 'Invalid / Missing query parameters: tblval'
					});
					return;
				}

				requestData.filtered(tblref, tblcol, tblval, limit, response);
			} else {
				// fetch all data
				if (tblref != undefined && tblref != null) {
					requestData.all(tblref, limit, response);
				} else {
					response.status(400).json({
						code: '400',
						status: 'Failure',
						message: 'Invalid / Missing query parameters: tblref'
					});
					return;
				}
			}
		} // end if not compnay id
	})
	.post(function(request, response) {
		// check endpoint ref
		var dbref = config.endpoints[request.params.name];
		if (dbref == undefined) {
			response.status(400).json({
				code: '400',
				status: 'Failure',
				message: 'Unavailable endpoint! Please check the api endpoint you are posting to.'
			});
			return;
		}
		newPostData[request.params.name](request.params.name, request.body, response);
		// response.status(200).send(JSON.stringify(request.body, null, 2))
	});

// Generic routes to PUT, PATCH and DELETE data
app
	.route('/:name/:id')
	.get(function(request, response) {
		if (
			request.params.name === 'companyvalues' ||
			request.params.name === 'pldptasks' ||
			request.params.name === 'tutorials' ||
			request.params.name === 'follower' ||
			request.params.name === 'postsanalytics'
		) {
			var tblref,
				id = '';
			tblref = config.endpoints[request.params.name];
			id = request.params.id;

			if (tblref == undefined || tblref == null) {
				response.status(400).json({
					code: '400',
					status: 'Failure',
					message: 'Invalid / Missing endpoint'
				});
				return;
			} else if (id == undefined || id == null || id.trim() == '') {
				response.status(400).json({
					code: '400',
					status: 'Failure',
					message: 'Invalid / Missing id'
				});
				return;
			}

			requestData.id(tblref, id, response);
		} else {
			response.status(400).json({
				code: '400',
				status: 'Failure',
				message: 'Invalid route or endpoint'
			});
			return;
		}
	})
	.put(function(request, response) {
		//update data
		updateData.patch(request.body.name, request.body.id, request.body, response);
	})
	.patch(function(request, response) {
		//update data
		updateData.patch(request.body.name, request.body.id, request.body, response);
	})
	.delete(function(request, response) {
		//delete data
		deleteData.delete(request.body, response);
	});

app.use((req, res, next) => {
	const error = new Error('Route not found!');
	// error.status(404);
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});
});

module.exports = app;
