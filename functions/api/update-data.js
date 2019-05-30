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

    if (name === "thoughts") {
      var user_type = body.user_type;
      var status = config.postStatus[3],
        companyID_status = "",
        dailyThoughtDescription,
        dailyThoughtType_status,
        publish_status = "";

      var timeInMs = Date.now();

      if (timeInMs > body.dateScheduled) status = config.postStatus[0];
      else status = config.postStatus[3];

      // Global Contributor User, Company Admin, Daily Thoughts, I-Leader, Organisation Contributor
      if (
        user_type == 4 ||
        user_type == 7 ||
        user_type == 9 ||
        user_type == 3 ||
        user_type == 11
      ) {
        dailyThoughtDescription =
          config.dailyThoughtTypeString[body.dailyThoughtType];
        dailyThoughtType_status = body.dailyThoughtType + "_" + status;
        companyID_status = body.companyID + "_" + status;
      }
      // Gold User - Master Contributor
      else if (user_type == 5) {
        // if its i-Lead post
        if (body.dailyThoughtType == 3) {
          // set public company ID and status
          companyID_status = config.publicAppID + "_" + status;
          // status here can approved or unpublished
          publish_status = config.publicAppID + "_" + status;
        } else {
          dailyThoughtType_status =
            body.dailyThoughtType + "_" + config.postStatus[2];
          companyID_status = body.companyID + "_" + config.postStatus[2];
          // status here pending
          publish_status = companyID_status;
        }
      }
      // Corporate I-Leader
      else if (user_type == 10) {
        // can only post to Corporate I-Lead function
        dailyThoughtType_status = body.dailyThoughtType + "_" + status;
        companyID_status = "corporate_ilead_" + status;
        // status here can approved or unpublished
        publish_status = body.companyID + "_ilead_" + status;
      } else {
        response.status(200).json({
          code: "400",
          status: "Failure",
          message: `This account is not authorised to post, Please contact the Admin.`
        });
        return;
      }

      // Publish Statuses
      // IF GC Posts Global
      if (user_type == 4 && body.dailyThoughtType == 2) {
        // status here can approved or unpublished
        publish_status = "hc_" + status;
      }
      // IF GC Posts Internal
      else if (user_type == 4 && body.dailyThoughtType == 1) {
        // status here can approved or unpublished
        publish_status = body.companyID + "_" + status;
      }
      // company admin or platinum admin or i-leader or standard user or organisation contributor for corporates
      else if (
        user_type == 7 ||
        user_type == 6 ||
        user_type == 3 ||
        user_type == 11
      ) {
        // status here can approved or unpublished
        publish_status = body.companyID + "_" + status;
      }
      // Daily thoughts user
      else if (user_type == 9) {
        // status will be approved or unpublished
        publish_status = "daily_" + status;
      }

      // If posting to I-Lead (Public or Corporate)
      if (body.dailyThoughtType === 3 && body.postingFrom === 1) {
        companyID_status = config.publicAppID + "_" + status;
        // overwrite companyID with publicID
        body.companyID = config.publicAppID;
        publish_status = config.publicAppID + "_" + status;
      } else if (body.dailyThoughtType === 3 && body.postingFrom === 2) {
        companyID_status = "corporate_ilead_" + status;
        // status here can approved or unpublished
        publish_status = body.companyID + "_ilead_" + status;
      }

      // If posting to I-Lead (Public)
      if (user_type === 3) {
        companyID_status = config.publicAppID + "_" + status;
        // overwrite companyID with publicID
        body.companyID = config.publicAppID;
        publish_status = config.publicAppID + "_" + status;
      }

      body.status = status;
      body.companyID_status = companyID_status;
      body.dailyThoughtDescription = dailyThoughtDescription;
      body.dailyThoughtType_status = dailyThoughtType_status;
      body.publish_status = publish_status;
    } else if (name === "articles") {
      var active = true,
        status = config.postStatus[3],
        companyID_status = "",
        dailyThoughtDescription,
        dailyThoughtType_status,
        articleTypeDescription;
      var user_type = body.user_type;

      var timeInMs = Date.now();

      if (timeInMs > body.dateScheduled) status = config.postStatus[0];
      else status = config.postStatus[3];

      dailyThoughtDescription =
        config.dailyThoughtTypeString[body.dailyThoughtType];
      dailyThoughtType_status = body.dailyThoughtType + "_" + status;
      articleTypeDescription = dailyThoughtDescription;
      companyID_status = body.companyID + "_" + status;

      // Global Contributor User, Company Admin, Daily Thoughts
      if (
        user_type == 4 ||
        user_type == 7 ||
        user_type == 9 ||
        user_type == 6
      ) {
        dailyThoughtDescription =
          config.dailyThoughtTypeString[body.dailyThoughtType];
        dailyThoughtType_status = body.dailyThoughtType + "_" + status;
        companyID_status = body.companyID + "_" + status;
      }
      // Gold User - Master Contributor
      else if (user_type == 5) {
        dailyThoughtType_status =
          body.dailyThoughtType + "_" + config.postStatus[2];
        companyID_status = body.companyID + "_" + config.postStatus[2];
      } else {
        response.status(200).json({
          code: "400",
          status: "Failure",
          message: `This account is not authorised to post, Please contact the Admin.`
        });
        return;
      }

      body.status = status;
      body.companyID_status = companyID_status;
      body.articleTypeDescription = articleTypeDescription;
      body.dailyThoughtDescription = dailyThoughtDescription;
      body.dailyThoughtType_status = dailyThoughtType_status;
    } else if (name === "podcasts") {
      var status = config.postStatus[3],
        companyID_status = "",
        company_status = "",
        dailyThoughtDescription,
        dailyThoughtType_status;

      var user_type = body.user_type;

      var timeInMs = Date.now();

      if (timeInMs > body.dateScheduled) status = config.postStatus[0];
      else status = config.postStatus[3];

      if (!body.author.trim()) {
        body.author = "";
      }

      company_status = "general_true";
      dailyThoughtDescription =
        config.dailyThoughtTypeString[body.dailyThoughtType];
      dailyThoughtType_status = body.dailyThoughtType + "_" + status;

      companyID_status = body.companyID + "_" + status;

      // Global Contributor User, Company Admin, Daily Thoughts
      if (
        user_type == 4 ||
        user_type == 7 ||
        user_type == 9 ||
        user_type == 6
      ) {
        dailyThoughtDescription =
          config.dailyThoughtTypeString[body.dailyThoughtType];
        dailyThoughtType_status = body.dailyThoughtType + "_" + status;
        companyID_status = body.companyID + "_" + status;
      }
      // Gold User - Master Contributor
      else if (user_type == 5) {
        dailyThoughtType_status =
          body.dailyThoughtType + "_" + config.postStatus[2];
        companyID_status = body.companyID + "_" + config.postStatus[2];
      } else {
        response.status(200).json({
          code: "400",
          status: "Failure",
          message: `This account is not authorised to post, Please contact the Admin.`
        });
        return;
      }
      body.dailyThoughtDescription = dailyThoughtDescription;
      body.dailyThoughtType_status = dailyThoughtType_status;
      body.companyID_status = companyID_status;

      body.status = status;
      body.company_status = company_status;
    } else if (name === "videos") {
      var status = config.postStatus[3],
        companyID_status = "",
        company_status = "",
        dailyThoughtDescription,
        dailyThoughtType_status;

      var user_type = body.user_type;

      var timeInMs = Date.now();

      if (timeInMs > body.dateScheduled) status = config.postStatus[0];
      else status = config.postStatus[3];

      if (!body.author.trim()) {
        body.author = "";
      }

      company_status = "general_true";
      dailyThoughtDescription =
        config.dailyThoughtTypeString[body.dailyThoughtType];
      dailyThoughtType_status = body.dailyThoughtType + "_" + status;

      companyID_status = body.companyID + "_" + status;

      // Global Contributor User, Company Admin, Daily Thoughts
      if (
        user_type == 4 ||
        user_type == 7 ||
        user_type == 9 ||
        user_type == 6
      ) {
        dailyThoughtDescription =
          config.dailyThoughtTypeString[body.dailyThoughtType];
        dailyThoughtType_status = body.dailyThoughtType + "_" + status;
        companyID_status = body.companyID + "_" + status;
      }
      // Gold User - Master Contributor
      else if (user_type == 5) {
        dailyThoughtType_status =
          body.dailyThoughtType + "_" + config.postStatus[2];
        companyID_status = body.companyID + "_" + config.postStatus[2];
      } else {
        response.status(200).json({
          code: "400",
          status: "Failure",
          message: `This account is not authorised to post, Please contact the Admin.`
        });
        return;
      }
      body.dailyThoughtDescription = dailyThoughtDescription;
      body.dailyThoughtType_status = dailyThoughtType_status;
      body.companyID_status = companyID_status;

      body.status = status;
      body.company_status = company_status;
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
