const functions = require("firebase-functions");
const admin = require("firebase-admin");

// CORS Express middleware to enable CORS Requests.
const cors = require("cors")({
  origin: true
});

exports.userExists = functions.https.onRequest((req, res) => {
  const email = req.query.email;

  admin
    .auth()
    .getUserByEmail(email)
    .then(function(userRecord) {
      // [START usingMiddleware]
      // Enable CORS using the `cors` express middleware.
      return cors(req, res, () => {
        // [END usingMiddleware]

        // [START sendResponse]
        // See the UserRecord reference doc for the contents of userRecord.
        console.log("Successfully fetched user data:", userRecord.toJSON());
        // auth/user-not-found

        res.status(200).send({
          code: "auth/email-already-exists",
          message:
            "The provided email is already in use by an existing user. Each user must have a unique email.",
          proceed: false
        });
        // [END sendResponse]
      });
    })
    .catch(function(error) {
      // [START usingMiddleware]
      // Enable CORS using the `cors` express middleware.
      return cors(req, res, () => {
        // [END usingMiddleware]

        // [START sendResponse]
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode === "auth/user-not-found") var proceed = true;
        else var proceed = false;

        console.log("Error fetching user data:", error);

        res
          .status(200)
          .send({ code: errorCode, message: errorMessage, proceed: proceed });
        // [END sendResponse]
      });
    });
});
