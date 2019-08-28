const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config");

module.exports = function() {
  // Delete data
  this.delete = function(body, response) {
    console.log("body received: ", body);
    // check if body contains id and name of the endpoint to be deleted
    if (!body.id || !body.name) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Invalid table or identifier provided!"
      });
      return;
    }

    if (!body.id.trim() || !body.name.trim()) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Invalid table or identifier provided!"
      });
      return;
    }

    var name = body.name;
    var id = body.id;

    // set tbl ref
    var dbref;
    if (name === "users") {
      dbref = name;
      var dbref2 = "user";
    } else {
      dbref = config.endpoints[name];
    }

    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are updating."
      });
      return;
    }

    if (!body.uid) {
      response
        .status(400)
        .json({ code: "400", status: "Failure", message: "Invalid user id." });
      return;
    }

    if (!body.uid.trim()) {
      response
        .status(400)
        .json({ code: "400", status: "Failure", message: "Invalid user id." });
      return;
    }

    var updates = {};
    if (dbref === "pldp-tasks") {
      if (!body.myPLDPID) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "Please provide task id"
        });
        return;
      }

      if (!body.myPLDPID.trim()) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "Please provide a valid task id"
        });
        return;
      }

      updates[`${dbref}/${id}/${body.myPLDPID}`] = null;

      if (body.notificationID != undefined) {
        console.log("delete notification: ", body.notificationID);
        admin
          .database()
          .ref("pldpNotifications/" + body.notificationID)
          .remove();
      }
    } else {
      if (name === "users") {
        updates[`${dbref}/${id}`] = null;
        updates[`${dbref2}/${id}`] = null;
      } else {
        if (body.dailyThoughtType === 4) {
          var dbref_2 = config.endpoints["companygroupposts"] + "/" + body.companyID;
          dbref = config.endpoints["groupposts"] + "/" + body.groupid;

          if(body.status === "unpublished"){
            dbref = "group-posts-unpublished";
            updates[`/${dbref}/${id}`] = null;
          }else{
            updates[`/${dbref}/${id}`] = null;
          }

          updates[`/${dbref_2}/${id}`] = null;
        }else{
          updates[`${dbref}/${id}`] = null;
        }
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
            payload: `Record deleted successfully!`
          });
          return;
        }
      });
  };
};
