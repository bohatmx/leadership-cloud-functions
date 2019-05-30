const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config.js");

// on create or update daily thoughts
exports.removePosts = functions.database
  .ref("/removePosts/{removePostsID}")
  .onCreate((snap, context) => {
    var oldPost = snap.val();

    var post = oldPost.post;
    var postType = oldPost.postType;

    var keyField = config.postKeyFields[postType];
    var id = post[keyField];

    if (id != undefined) {
      admin
        .database()
        .ref(config.postTypes[postType])
        .child(post[keyField])
        .remove()
        .then(() => {
          admin
            .database()
            .ref()
            .child("/createPosts")
            .push(oldPost);
        });
    }

    console.log("New post to remove => keyField: " + keyField + " id: " + id);
    console.log("New post to remove 2 => keyField: ", post);

    return snap.ref.remove();
  });
