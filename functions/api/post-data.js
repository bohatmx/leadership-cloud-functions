const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config");

module.exports = function() {
  // New thoughts
  this.thoughts = function(name, body, response) {
    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.dailyThoughtType ||
      !body.dateRegistered ||
      !body.dateScheduled ||
      !body.journalUserID.trim() ||
      !body.journalUserName.trim() ||
      !body.user_type ||
      !body.postingFrom
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (body.dailyThoughtType < 0 || body.dailyThoughtType > 3) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Please check thought type before posting."
      });
      return;
    }

    if (!body.logo) {
      body.logo = "";
    }
    if (!body.website) {
      body.website = "";
    }
    if (!body.slogan) {
      body.slogan = "";
    }
    if (!body.subtitle) {
      body.subtitle = "";
    }
    if (!body.title) {
      body.title = "";
    }

    var active = true,
      status = config.postStatus[3],
      companyID_status = "",
      dailyThoughtDescription,
      dailyThoughtType_status,
      topLeader_status = "false",
      publish_status = "",
      stringDateRegistered,
      stringDateScheduled,
      dateUpdated,
      dailyThoughtID = 0;
    var user_type = body.user_type;

    var timeInMs = Date.now();
    stringDateRegistered = new Date(body.dateRegistered).toLocaleString();
    stringDateScheduled = new Date(body.dateScheduled).toLocaleString();
    dateUpdated = timeInMs;

    if (timeInMs > body.dateScheduled) status = config.postStatus[0];
    else status = config.postStatus[3];

    dailyThoughtDescription =
      config.dailyThoughtTypeString[body.dailyThoughtType];
    dailyThoughtType_status = body.dailyThoughtType + "_" + status;
    companyID_status = body.companyID + "_" + status;

    if (user_type == 4 && status == config.postStatus[0])
      topLeader_status = "true_" + status;
    else topLeader_status = "false";

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

    body.active = active;
    body.status = status;
    body.companyID_status = companyID_status;
    body.dailyThoughtDescription = dailyThoughtDescription;
    body.dailyThoughtType_status = dailyThoughtType_status;
    body.topLeader_status = topLeader_status;
    body.publish_status = publish_status;
    body.stringDateRegistered = stringDateRegistered;
    body.stringDateScheduled = stringDateScheduled;
    body.dateUpdated = dateUpdated;

    // Generate postID
    dailyThoughtID = admin
      .database()
      .ref(dbref)
      .push().key;
    body.dailyThoughtID = dailyThoughtID;

    // Write the new thought's data
    var updates = {};

    // podcasts entries
    if (body.podcasts) {
      for (var podcast in body.podcasts) {
        body.podcasts[podcast].dailyThoughtID = dailyThoughtID;
        updates[`podcasts/` + podcast] = body.podcasts[podcast];
      }
    }

    // photos entries
    if (body.photos) {
      for (var photo in body.photos) {
        body.photos[photo].dailyThoughtID = dailyThoughtID;
        updates[`photos/` + photo] = body.photos[photo];
      }
    }

    // videos entries
    if (body.videos) {
      for (var video in body.videos) {
        body.videos[video].dailyThoughtID = dailyThoughtID;
        updates[`videos/` + video] = body.videos[video];
      }
    }

    // set body data
    updates[`/${dbref}/` + dailyThoughtID] = body;
    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New articles
  this.articles = function(name, body, response) {
    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.dailyThoughtType ||
      !body.dateRegistered ||
      !body.dateScheduled ||
      !body.journalUserID.trim() ||
      !body.journalUserName.trim() ||
      !body.articleType ||
      !body.user_type ||
      !body.subtitle.trim() ||
      !body.title.trim() ||
      !body.manualOrExternal.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (body.articleType === 1) {
      if (!body.body.trim()) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }
    }
    if (body.articleType === 2) {
      if (!body.articleLink.trim()) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }
    }

    if (
      body.articleType < 0 ||
      body.articleType > 2 ||
      body.dailyThoughtType < 0 ||
      body.dailyThoughtType > 2
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Please check article type before posting."
      });
      return;
    }

    var active = true,
      status = config.postStatus[3],
      companyID_status = "",
      dailyThoughtDescription,
      dailyThoughtType_status,
      articleTypeDescription,
      topLeader_status = "false",
      stringDateRegistered,
      stringDateScheduled,
      dateUpdated,
      newsID = 0;
    var user_type = body.user_type;

    var timeInMs = Date.now();
    stringDateRegistered = new Date(body.dateRegistered).toLocaleString();
    stringDateScheduled = new Date(body.dateScheduled).toLocaleString();
    dateUpdated = timeInMs;

    if (timeInMs > body.dateScheduled) status = config.postStatus[0];
    else status = config.postStatus[3];

    dailyThoughtDescription =
      config.dailyThoughtTypeString[body.dailyThoughtType];
    dailyThoughtType_status = body.dailyThoughtType + "_" + status;
    articleTypeDescription = dailyThoughtDescription;
    companyID_status = body.companyID + "_" + status;

    if (user_type == 4 && status == config.postStatus[0])
      topLeader_status = "true_" + status;
    else topLeader_status = "false";

    // Global Contributor User, Company Admin, Daily Thoughts
    if (user_type == 4 || user_type == 7 || user_type == 9 || user_type == 6) {
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

    body.active = active;
    body.status = status;
    body.companyID_status = companyID_status;
    body.articleTypeDescription = articleTypeDescription;
    body.dailyThoughtDescription = dailyThoughtDescription;
    body.dailyThoughtType_status = dailyThoughtType_status;
    body.topLeader_status = topLeader_status;
    body.stringDateRegistered = stringDateRegistered;
    body.stringDateScheduled = stringDateScheduled;
    body.dateUpdated = dateUpdated;
    body.articleDate = dateUpdated;

    // Generate postID
    newsID = admin
      .database()
      .ref(dbref)
      .push().key;
    body.newsID = newsID;

    // Write the new thought's data
    var updates = {};

    // podcasts entries
    if (body.podcasts) {
      for (var podcast in body.podcasts) {
        body.podcasts[podcast].newsID = newsID;
        updates[`podcasts/` + podcast] = body.podcasts[podcast];
      }
    }

    // photos entries
    if (body.photos) {
      for (var photo in body.photos) {
        body.photos[photo].newsID = newsID;
        updates[`photos/` + photo] = body.photos[photo];
      }
    }

    // videos entries
    if (body.videos) {
      for (var video in body.videos) {
        body.videos[video].newsID = newsID;
        updates[`videos/` + video] = body.videos[video];
      }
    }

    // set body data
    updates[`/${dbref}/` + newsID] = body;

    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New podcasts
  this.podcasts = function(name, body, response) {
    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.dateRegistered ||
      !body.dateScheduled ||
      !body.userID.trim() ||
      !body.userName.trim() ||
      !body.user_type ||
      !body.podcastType ||
      !body.title.trim() ||
      !body.UploadExternal.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (body.podcastType < 0 || body.podcastType > 2) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Please check podcast type before posting."
      });
      return;
    }

    if (body.UploadExternal.trim() == "external") {
      if (!body.url.trim()) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }
    }

    var active = true,
      status = config.postStatus[3],
      companyID_status = "",
      company_status = "",
      dailyThoughtDescription,
      dailyThoughtType_status,
      topLeader_status = "false",
      stringDateRegistered,
      stringDateScheduled,
      podcastID = 0,
      podcastDescription = config.podcastTypeDesc[body.podcastType],
      storageName = body.title,
      podcastSize = 0;
    var user_type = body.user_type;

    var timeInMs = Date.now();
    stringDateRegistered = new Date(body.dateRegistered).toLocaleString();
    stringDateScheduled = new Date(body.dateScheduled).toLocaleString();

    if (timeInMs > body.dateScheduled) status = config.postStatus[0];
    else status = config.postStatus[3];

    if (body.attachment === false) {
      if (!body.author.trim()) {
        // response.status(400).json({
        //   code: "400",
        //   status: "Failure",
        //   message: "There are some missing fields, please check before posting."
        // });
        // return;
        body.author = "";
      }
      company_status = "general_true";
      dailyThoughtDescription =
        config.dailyThoughtTypeString[body.dailyThoughtType];
      dailyThoughtType_status = body.dailyThoughtType + "_" + status;

      companyID_status = body.companyID + "_" + status;

      if (user_type == 4 && status == config.postStatus[0])
        topLeader_status = "true_" + status;
      else topLeader_status = "false";

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
    } else {
      company_status = body.companyID + "_true";
    }

    body.active = active;
    body.status = status;
    body.company_status = company_status;
    body.podcastDescription = podcastDescription;
    body.storageName = storageName;
    body.topLeader_status = topLeader_status;
    body.stringDateRegistered = stringDateRegistered;
    body.stringDateScheduled = stringDateScheduled;
    body.podcastSize = podcastSize;

    // Generate postID
    podcastID = admin
      .database()
      .ref(dbref)
      .push().key;
    body.podcastID = podcastID;

    // Write the new podcast's data
    var updates = {};
    updates[`/${dbref}/` + podcastID] = body;
    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New videos
  this.videos = function(name, body, response) {
    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.dateRegistered ||
      !body.dateScheduled ||
      !body.userID.trim() ||
      !body.userName.trim() ||
      !body.user_type ||
      !body.title.trim() ||
      !body.UploadExternal.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (
      body.UploadExternal.trim() == "external" ||
      body.UploadExternal.trim() == "videxternal"
    ) {
      if (!body.url.trim()) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }
    }

    var active = true,
      status = config.postStatus[3],
      companyID_status = "",
      company_status = "",
      dailyThoughtDescription,
      dailyThoughtType_status,
      topLeader_status = "false",
      stringDateRegistered,
      stringDateScheduled,
      videoID = 0,
      storageName = body.title,
      videoSize = 0,
      lengthInSeconds = 0;
    var user_type = body.user_type;

    var timeInMs = Date.now();
    stringDateRegistered = new Date(body.dateRegistered).toLocaleString();
    stringDateScheduled = new Date(body.dateScheduled).toLocaleString();

    if (timeInMs > body.dateScheduled) status = config.postStatus[0];
    else status = config.postStatus[3];

    if (body.attachment === false) {
      if (!body.author.trim()) {
        // response.status(400).json({
        //   code: "400",
        //   status: "Failure",
        //   message: "There are some missing fields, please check before posting."
        // });
        // return;

        body.author = "";
      }
      company_status = "general_true";
      dailyThoughtDescription =
        config.dailyThoughtTypeString[body.dailyThoughtType];
      dailyThoughtType_status = body.dailyThoughtType + "_" + status;

      companyID_status = body.companyID + "_" + status;

      if (user_type == 4 && status == config.postStatus[0])
        topLeader_status = "true_" + status;
      else topLeader_status = "false";

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
    } else {
      company_status = body.companyID + "_true";
    }

    body.active = active;
    body.status = status;
    body.company_status = company_status;
    body.storageName = storageName;
    body.description = body.description;
    body.caption = body.title;
    body.topLeader_status = topLeader_status;
    body.date = body.dateRegistered;
    body.dateUploaded = body.dateRegistered;
    body.stringDate = stringDateRegistered;
    body.stringDateUploaded = stringDateRegistered;
    body.stringDateRegistered = stringDateRegistered;
    body.stringDateScheduled = stringDateScheduled;
    body.videoSize = videoSize;
    body.lengthInSeconds = lengthInSeconds;

    // Generate postID
    videoID = admin
      .database()
      .ref(dbref)
      .push().key;
    body.videoID = videoID;

    // Write the new podcast's data
    var updates = {};
    updates[`/${dbref}/` + videoID] = body;
    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New users
  this.users = function(name, body, response) {
    var password,
      stringDateRegistered,
      dateRegistered,
      userDescription,
      companyID_userType,
      userType;

    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.email.trim() ||
      !body.firstName.trim() ||
      !body.lastName.trim() ||
      !body.user_type
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    password =
      Math.random()
        .toString(36)
        .substring(2, 6) +
      Math.random()
        .toString(36)
        .substring(2, 6);
    password = password.toUpperCase();

    dateRegistered = Date.now();
    stringDateRegistered = new Date(dateRegistered).toLocaleString();
    userDescription = config.userTypesDesc[body.user_type];
    userType = body.user_type;
    companyID_userType = body.companyID + "_" + userType;

    body.dateRegistered = dateRegistered;
    body.stringDateRegistered = stringDateRegistered;
    body.password = password;
    body.companyID_userType = companyID_userType;
    body.userDescription = userDescription;
    body.userType = userType;

    delete body["user_type"];

    // Generate postID
    newUploadUserID = admin
      .database()
      .ref(dbref)
      .push().key;
    body.newUploadUserID = newUploadUserID;

    // Write the new podcast's data
    var updates = {};
    updates[`/${dbref}/` + newUploadUserID] = body;
    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        delete body["password"];

        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New pldp tasks
  this.pldptasks = function(name, body, response) {
    // check if all fields are provided
    if (
      !body.companyID ||
      !body.companyName ||
      !body.dateRegistered ||
      !body.journalUserName ||
      !body.moveAction ||
      !body.moveActionDesc ||
      !body.user_type ||
      !body.title ||
      !body.uid
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.journalUserName.trim() ||
      !body.moveAction.trim() ||
      !body.moveActionDesc.trim() ||
      !body.title.trim() ||
      !body.uid.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    // set tbl ref
    var dbref = "pldp-tasks/" + body.journalUserID;
    var dbref2 = "pldpNotifications";

    var active = true,
      stringDateRegistered,
      userType,
      myPLDPID,
      notificationID,
      reminderStatus = "Sent",
      stringReminderDate,
      userDescription;

    if (body.reminderOn === true) {
      if (!body.reminderDate || !body.reminderFrequency.trim()) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message:
            "There are some missing fields, please check reminder date or frequency before posting."
        });
        return;
      }

      stringReminderDate = new Date(body.reminderDate).toLocaleString();

      if (body.reminderDate > body.dateRegistered) reminderStatus = "Unsent";
      else {
        reminderStatus = "Sent";
        body.reminderFrequency = "Does not repeat";
      }
    } else {
      reminderStatus = "Sent";
      body.reminderFrequency = "Does not repeat";
      stringReminderDate = body.stringReminderDate;
    }

    stringDateRegistered = new Date(body.dateRegistered).toLocaleString();
    userDescription = config.userTypesDesc[body.user_type];
    userType = body.user_type;

    body.active = active;
    body.journalUserID_Active = body.journalUserID + "_" + active;
    body.reminderStatus = reminderStatus;
    body.stringDateRegistered = stringDateRegistered;
    body.stringReminderDate = stringReminderDate;
    body.userDescription = userDescription;
    body.userType = userType;

    delete body["user_type"];

    // Generate postID
    myPLDPID = admin
      .database()
      .ref(dbref)
      .push().key;
    notificationID = admin
      .database()
      .ref(dbref2)
      .push().key;

    body.myPLDPID = myPLDPID;
    body.notificationID = notificationID;

    // Write the new podcast's data
    var updates = {};
    updates[`/${dbref}/` + myPLDPID] = body;
    updates[`/${dbref2}/` + notificationID] = body;

    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New company values
  this.companyvalues = function(name, body, response) {
    // check if all fields are provided
    if (!body.companyID || !body.companyName || !body.valueDesc) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.valueDesc.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    // set tbl ref
    var dbref = config.endpoints[name];

    var status = "active",
      valueID,
      dateRegistered,
      companyID_status = body.companyID + "_active";

    dateRegistered = Date.now();

    // Generate postID
    valueID = admin
      .database()
      .ref(dbref)
      .push().key;

    body.valueID = valueID;
    body.status = status;
    body.companyID_status = companyID_status;
    body.dateRegistered = dateRegistered;

    // Write the new podcast's data
    var updates = {};
    updates[`/${dbref}/` + valueID] = body;

    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New feedback
  this.feedback = function(name, body, response) {
    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.companyID ||
      !body.companyName ||
      !body.category ||
      !body.journalUserID ||
      !body.journalUserName ||
      !body.journalUserEmail ||
      !body.message ||
      !body.subject
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.journalUserName.trim() ||
      !body.journalUserID.trim() ||
      !body.category.trim() ||
      !body.journalUserEmail.trim() ||
      !body.message.trim() ||
      !body.subject.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (!body.userPlatform) {
      body.userPlatform = "Platform not specified!";
    }

    var dateRegistered, feedbackID;

    dateRegistered = Date.now();
    body.dateRegistered = dateRegistered;

    // Generate postID
    feedbackID = admin
      .database()
      .ref(dbref)
      .push().key;
    body.feedbackID = feedbackID;

    // Write the new podcast's data
    var updates = {};
    updates[`/${dbref}/` + feedbackID] = body;

    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response
          .status(200)
          .json({ code: "200", status: "Success", payload: body });
        return;
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New follower
  this.follower = function(name, body, response) {
    // set tbl ref
    var dbref = config.endpoints[name];
    if (dbref == undefined) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message:
          "Unavailable endpoint! Please check the api endpoint you are posting to."
      });
      return;
    }

    // check if all fields are provided
    if (
      !body.followerCompanyID ||
      !body.followerCompanyName ||
      !body.followerFirstName ||
      !body.followerLastName ||
      !body.followerUserID ||
      !body.parentUserID ||
      !body.parentCompanyID ||
      !body.parentCompanyName ||
      !body.parentFirstName ||
      !body.parentLastName ||
      !body.followUnfollow
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (
      !body.followerCompanyID.trim() ||
      !body.followerCompanyName.trim() ||
      !body.followerFirstName.trim() ||
      !body.followerLastName.trim() ||
      !body.followerUserID.trim() ||
      !body.parentUserID.trim() ||
      !body.parentCompanyID.trim() ||
      !body.parentCompanyName.trim() ||
      !body.parentFirstName.trim() ||
      !body.parentLastName.trim() ||
      !body.followUnfollow.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (!body.followerPhotoURL) {
      body.followerPhotoURL =
        "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    if (!body.parentPhotoURL) {
      body.parentPhotoURL =
        "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    var dateRegistered,
      parentUserID,
      followerUserID,
      followerData = {},
      parentData = {};

    dateRegistered = Date.now();

    // follower data
    followerData.photoURL = body.followerPhotoURL;
    followerData.dateRegistered = dateRegistered;
    followerData.companyID = body.followerCompanyID;
    followerData.companyName = body.followerCompanyName;
    followerData.firstName = body.followerFirstName;
    followerData.lastName = body.followerLastName;
    followerData.userID = body.followerUserID;

    // parent data
    parentData.photoURL = body.parentPhotoURL;
    parentData.dateRegistered = dateRegistered;
    parentData.companyID = body.parentCompanyID;
    parentData.companyName = body.parentCompanyName;
    parentData.firstName = body.parentFirstName;
    parentData.lastName = body.parentLastName;
    parentData.userID = body.parentUserID;

    parentUserID = body.parentUserID;
    followerUserID = body.followerUserID;

    // Write the new podcast's data
    var updates = {};

    if (body.followUnfollow.trim().toLowerCase() === "follow") {
      updates[
        `/${dbref}/` + parentUserID + `/${followerUserID}`
      ] = followerData;
      updates[
        `/users/` + parentUserID + `/follower/${followerUserID}`
      ] = followerData;
      updates[
        `/users/` + followerUserID + `/following/${parentUserID}`
      ] = parentData;
    } else if (body.followUnfollow.trim().toLowerCase() === "unfollow") {
      updates[`/${dbref}/` + parentUserID + `/${followerUserID}`] = null;
      updates[`/users/` + parentUserID + `/follower/${followerUserID}`] = null;
      updates[`/users/` + followerUserID + `/following/${parentUserID}`] = null;
    } else {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Please specify whether you are following or unfollowing!"
      });
      return;
    }

    admin
      .database()
      .ref()
      .update(updates)
      .then(() => {
        response.status(200).json({
          code: "200",
          status: "Success",
          payload: {
            follower: followerData,
            parent: parentData
          }
        });
      })
      .catch(err => {
        response
          .status(400)
          .json({ code: "400", status: "Failure", message: `${err.message}` });
        return;
      });
  };
  // New likes
  this.likes = function(name, body, response) {
    // check if all fields are provided
    if (
      !body.companyID ||
      !body.companyName ||
      !body.journalUserID ||
      !body.journalUserName ||
      !body.postType ||
      !body.postID ||
      !body.likeUnlike
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (
      !body.companyID.trim() ||
      !body.companyName.trim() ||
      !body.journalUserID.trim() ||
      !body.journalUserName.trim() ||
      !body.postType.trim() ||
      !body.postID.trim() ||
      !body.likeUnlike.trim()
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "There are some missing fields, please check before posting."
      });
      return;
    }

    if (!body.photoURL) {
      body.photoURL =
        "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
    }

    // set tbl ref
    var dbref = config.endpoints[body.postType.trim()];

    if (
      dbref === undefined ||
      !body.postType.trim() === "thoughts" ||
      !body.postType.trim() === "articles" ||
      !body.postType.trim() === "podcasts" ||
      !body.postType.trim() === "videos"
    ) {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Unavailable post type! Please check post type parameter."
      });
      return;
    }

    var dateRegistered,
      data = {},
      clickData = {};
    dateRegistered = Date.now();
    var stringDateRegistered = new Date(dateRegistered).toLocaleString();
    var likeType = body.likeUnlike.trim().toLowerCase();

    // likes data
    data.companyID = body.companyID;
    data.companyName = body.companyName;
    data.journalUserID = body.journalUserID;
    data.journalUserName = body.journalUserName;
    data.likesDate = dateRegistered;
    data.likesStringDate = stringDateRegistered;
    data.photoURL = body.photoURL;
    data.postType = body.postType;
    data.itemID = body.postID;
    data.userPost = body.journalUserID + "_" + body.postID;

    // click data - analytics
    clickData.myCompanyID = body.companyID;
    clickData.myCompanyName = body.companyName;
    clickData.userID = body.journalUserID;
    clickData.userName = body.journalUserName;
    clickData.dateRegistered = dateRegistered;
    clickData.likesStringDate = stringDateRegistered;
    clickData.myPhoto = body.photoURL;
    clickData.postType = body.postType;
    clickData.journalID = body.postID;
    clickData.clickType = "posts";
    clickData.clickArea = "like";
    clickData.clickItem = "button";

    var updates = {};

    // post / remove like data
    if (likeType === "like" || likeType === "likes") {
      // Write the new podcast's data
      updates[
        dbref + "/" + data.itemID + "/likes/" + data.journalUserID
      ] = true;
      updates[
        dbref + "/" + data.itemID + "/likesData/" + data.journalUserID
      ] = data;
      updates["user-liked/" + data.userPost] = data;
      updates["user-clicks/" + data.userPost] = clickData;
    } else if (likeType === "unlike" || likeType === "unlikes") {
      // remove like data
      updates[
        dbref + "/" + data.itemID + "/likes/" + data.journalUserID
      ] = null;
      updates[
        dbref + "/" + data.itemID + "/likesData/" + data.journalUserID
      ] = null;
      updates["user-liked/" + data.userPost] = null;
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
          if (likeType === "like" || likeType === "likes") {
            let countLikes = admin
              .database()
              .ref(dbref)
              .child(data.itemID)
              .child("countLikes");
            let currentCount = countLikes.transaction(function(current) {
              return (current || 0) + 1;
            });
          } else {
            let countLikes = admin
              .database()
              .ref(dbref)
              .child(data.itemID)
              .child("countLikes");
            let currentCount = countLikes.transaction(function(current) {
              if (current == 0 || current == undefined) {
                return current;
              } else {
                return (current || 0) - 1;
              }
            });
          }

          response
            .status(200)
            .json({ code: "200", status: "Success", payload: data });
        }
      });
  };
  // New comments
  this.comments = function(name, body, response) {
    // check if all fields are provided
    if (
      body.commentUncomment &&
      body.commentUncomment.trim().toLowerCase() === "comment"
    ) {
      if (
        !body.companyID ||
        !body.companyName ||
        !body.journalUserID ||
        !body.journalUserName ||
        !body.postType ||
        !body.postID ||
        !body.comment
      ) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      if (
        !body.companyID.trim() ||
        !body.companyName.trim() ||
        !body.journalUserID.trim() ||
        !body.journalUserName.trim() ||
        !body.postType.trim() ||
        !body.postID.trim() ||
        !body.comment.trim()
      ) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      if (!body.photoURL) {
        body.photoURL =
          "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }

      // set tbl ref
      var dbref = config.endpoints[body.postType.trim()];
      if (dbref == undefined) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "Unavailable post type! Please check post type parameter."
        });
        return;
      }

      var dateRegistered,
        commentID,
        data = {},
        clickData = {};
      dateRegistered = Date.now();
      var stringDateRegistered = new Date(dateRegistered).toLocaleString();

      commentID = admin
        .database()
        .ref()
        .child("/" + dbref + "/" + body.postID.trim() + "/comments")
        .push().key;

      // comments data
      data.companyID = body.companyID;
      data.companyName = body.companyName;
      data.journalUserID = body.journalUserID;
      data.journalUserName = body.journalUserName;
      data.date = dateRegistered;
      data.stringDate = stringDateRegistered;
      data.stringCommentDate = stringDateRegistered;
      data.photoURL = body.photoURL;
      data.postType = body.postType;
      data.dailyThoughtID = body.postID;
      data.commentID = commentID;
      data.comment = body.comment;

      // click data - analytics
      clickData.myCompanyID = body.companyID;
      clickData.myCompanyName = body.companyName;
      clickData.userID = body.journalUserID;
      clickData.userName = body.journalUserName;
      clickData.dateRegistered = dateRegistered;
      clickData.commentID = commentID;
      clickData.myPhoto = body.photoURL;
      clickData.postType = body.postType;
      clickData.journalID = body.postID;
      clickData.clickType = "posts";
      clickData.clickArea = "comment";
      clickData.clickItem = "button";

      var updates = {};

      // post comments
      updates[
        "/" + dbref + "/" + body.postID.trim() + "/comments/" + commentID
      ] = data;
      updates["/comments/" + commentID] = data;
      updates["user-clicks/" + commentID] = clickData;
    } else if (
      body.commentUncomment &&
      body.commentUncomment.trim().toLowerCase() === "uncomment"
    ) {
      if (!body.commentID || !body.postType || !body.postID) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      if (
        !body.commentID.trim() ||
        !body.postType.trim() ||
        !body.postID.trim()
      ) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      // set tbl ref
      var dbref = config.endpoints[body.postType.trim()];

      if (dbref == undefined) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "Unavailable post type! Please check post type parameter."
        });
        return;
      }

      var updates = {};
      // post comments
      updates[
        "/" + dbref + "/" + body.postID.trim() + "/comments/" + body.commentID
      ] = null;
      updates["/comments/" + body.commentID] = null;
    } else {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Please specify whether you are commenting or uncommenting!"
      });
      return;
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
          response
            .status(200)
            .json({ code: "200", status: "Success", payload: data });
          return;
        }
      });
  };
  // New subcomments
  this.subcomments = function(name, body, response) {
    console.log("subcomments: ", body);
    // check if all fields are provided
    if (
      body.commentUncomment &&
      body.commentUncomment.trim().toLowerCase() === "comment"
    ) {
      if (
        !body.companyID ||
        !body.companyName ||
        !body.journalUserID ||
        !body.journalUserName ||
        !body.postType ||
        !body.postID ||
        !body.comment ||
        !body.parentID
      ) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      if (
        !body.companyID.trim() ||
        !body.companyName.trim() ||
        !body.journalUserID.trim() ||
        !body.journalUserName.trim() ||
        !body.postType.trim() ||
        !body.postID.trim() ||
        !body.comment.trim() ||
        !body.parentID.trim()
      ) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      if (!body.photoURL) {
        body.photoURL =
          "https://firebasestorage.googleapis.com/v0/b/leadershipplatform-158316.appspot.com/o/mailassets%2Fdefault-user.png?alt=media&token=ea955943-9b02-4cd9-95c0-cd1436569498";
      }

      // set tbl ref
      var dbref = config.endpoints[body.postType.trim()];

      if (dbref == undefined) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "Unavailable post type! Please check post type parameter."
        });
        return;
      }

      var dateRegistered,
        subcommentID,
        data = {},
        clickData = {};
      dateRegistered = Date.now();
      var stringDateRegistered = new Date(dateRegistered).toLocaleString();

      subcommentID = admin
        .database()
        .ref()
        .child(
          "/" +
            dbref +
            "/" +
            body.postID.trim() +
            "/comments/" +
            body.parentID.trim() +
            "/subComments"
        )
        .push().key;

      // comments data
      data.companyID = body.companyID;
      data.companyName = body.companyName;
      data.journalUserID = body.journalUserID;
      data.journalUserName = body.journalUserName;
      data.date = dateRegistered;
      data.stringDate = stringDateRegistered;
      data.stringCommentDate = stringDateRegistered;
      data.photoURL = body.photoURL;
      data.postType = body.postType;
      data.dailyThoughtID = body.postID;
      data.commentID = subcommentID;
      data.parentID = body.parentID;
      data.comment = body.comment;

      // click data - analytics
      clickData.myCompanyID = body.companyID;
      clickData.myCompanyName = body.companyName;
      clickData.userID = body.journalUserID;
      clickData.userName = body.journalUserName;
      clickData.dateRegistered = dateRegistered;
      clickData.commentID = subcommentID;
      data.parentID = body.parentID;
      clickData.myPhoto = body.photoURL;
      clickData.postType = body.postType;
      clickData.journalID = body.postID;
      clickData.clickType = "posts";
      clickData.clickArea = "comment";
      clickData.clickItem = "button";

      var updates = {};

      // post comments
      updates[
        "/" +
          dbref +
          "/" +
          body.postID.trim() +
          "/comments/" +
          body.parentID +
          "/subComments/" +
          subcommentID
      ] = data;
      updates[
        "/comments/" + body.parentID + "/subComments" + subcommentID
      ] = data;
      updates["user-clicks/" + subcommentID] = clickData;
    } else if (
      body.commentUncomment &&
      body.commentUncomment.trim().toLowerCase() === "uncomment"
    ) {
      if (!body.commentID || !body.parentID || !body.postType || !body.postID) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      if (
        !body.commentID.trim() ||
        !body.parentID.trim() ||
        !body.postType.trim() ||
        !body.postID.trim()
      ) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "There are some missing fields, please check before posting."
        });
        return;
      }

      // set tbl ref
      var dbref = config.endpoints[body.postType.trim()];

      if (dbref == undefined) {
        response.status(400).json({
          code: "400",
          status: "Failure",
          message: "Unavailable post type! Please check post type parameter."
        });
        return;
      }

      var updates = {};
      // post comments
      updates[
        "/" +
          dbref +
          "/" +
          body.postID.trim() +
          "/comments/" +
          body.parentID +
          "/subComments/" +
          body.commentID
      ] = null;
      updates[
        "/comments/" + body.parentID + "/subComments/" + body.commentID
      ] = null;
    } else {
      response.status(400).json({
        code: "400",
        status: "Failure",
        message: "Please specify whether you are commenting or uncommenting!"
      });
      return;
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
          response
            .status(200)
            .json({ code: "200", status: "Success", payload: data });
          return;
        }
      });
  };
};
