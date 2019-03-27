const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config");

module.exports = function() {
  // Update data
  this.patch = function(name, id, body, response) {
    // set tbl ref
    var dbref;
    if (name === "users") {
      dbref = name;
      var dbref2 = "user";
      var uid = body.uid;
    } else dbref = config.endpoints[name];

    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are updating."
      });
      return;
    }

    if (id === undefined || id === null) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Unavailable ID field! Please check the id you are posting to."
      });
      return;
    }

    delete body["id"];
    delete body["name"];

    var updates = {};

    for (var key in body) {
      if (body.hasOwnProperty(key)) {
        if (name === "users") {
          updates[`${dbref}/${id}/` + key] = body[key];
          updates[`${dbref2}/${uid}/` + key] = body[key];
        } else {
          updates[`${dbref}/${id}/` + key] = body[key];
        }
      }
    }

    if (name === "users") {
      var subscriber = {
        userID: body.userID,
        companyID: body.companyID,
        email: body.email,
        dateRegistered: Date.now()
      };

      // subscribe user
      if (body.receiveEmails == true) {
        updates["unsubscribed/" + body.userID] = null;
        updates["subscribed/" + body.userID] = subscriber;
      } else {
        updates["unsubscribed/" + body.userID] = subscriber;
        updates["subscribed/" + body.userID] = null;
      }
    }

    admin
      .database()
      .ref()
      .update(updates, function(error) {
        if (error) {
          response.status(400).json({
            code: "400",
            status: "Failure",
            message: `${error.message}`
          });
          return;
        } else {
          response.status(200).json({
            code: "200",
            status: "Success",
            payload: `Successfully updated ${name} for ${id}`
          });
          return;
        }
      });
  };
};
