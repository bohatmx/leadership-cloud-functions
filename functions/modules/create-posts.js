const functions = require("firebase-functions");
const admin = require("firebase-admin");
const config = require("./config.js");

// on create or update daily thoughts
exports.createPosts = functions.database
  .ref("/createPosts/{createPostsID}")
  .onCreate((snap, context) => {
    var self = this;
    var createPost = snap.val();
    var post = createPost.post;
    var postType = createPost.postType;

    setTimeout(function() {
      createNewPosts(post, postType);
    }, 3000);

    return snap.ref.remove();
  });

function createNewPosts(post, postType) {
  console.log("new post: ", post);
  console.log("new postType: ", postType);

  var keyField = config.postKeyFields[postType];
  var id = post[keyField];

  var newItemID = admin
    .database()
    .ref()
    .child(config.postTypes[postType])
    .push().key;

  post[keyField] = newItemID;

  // Write the new notification's data
  var updates = {};
  updates["/" + config.postTypes[postType] + "/" + newItemID] = post;

  admin
    .database()
    .ref(config.postTypes[postType] + "/" + newItemID)
    .set(post)
    .then(update_res => {
      console.log(
        "Success created post published id: " +
          newItemID +
          " old id: " +
          id +
          " postType: " +
          postType
      );
    })
    .catch(error => {
      console.log(
        "Error updating post published id " +
          newItemID +
          " postType: " +
          postType
      );
    });
}
