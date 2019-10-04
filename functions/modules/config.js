// Environment - 0 -> Development, 1 -> Live

// Test - https://glp-test.firebaseapp.com/
// Public - https://thinklead.app/
// Corporate - https://oneconnect.thinklead.co.za/

// https://us-central1-glp-test.cloudfunctions.net/
// https://us-central1-leadershipplatform-158316.cloudfunctions.net/

module.exports = {
  environment: 0,
  serverKey:
    "key=AAAAZgwTzHM:APA91bE3GGJDu3JikXmXjWlX9dh0teidOTnzIG97HZsfEGu4YEIrj7Gs4c3WqO-8PMjI259pGoyFtzQ-6VXgKsEX2kBebGl0mNXVp5hxlyCBrf8WPT1pNiJNvO70Vn3c8xghVyR2M7nI",
  senderID: "438289288307",
  sgKey:
    "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",
  url: {
    0: "http://glp-test.appspot.com/",
    1: "https://thinklead.app/"
  },
  serverurl: {
    0: "https://us-central1-glp-test.cloudfunctions.net/",
    1: "https://us-central1-leadershipplatform-158316.cloudfunctions.net/"
  },
  databaseurl: {
    0: "https://glp-test.firebaseio.com",
    1: "https://leadershipplatform-158316.firebaseio.com"
  },
  serviceaccount: {
    0: "glp-test-firebase-adminsdk-58xlx-84586619f2.json",
    1: "leadershipplatform-158316-firebase-adminsdk-goitz-f99dd5b92d.json"
  },
  postTypes: {
    thought: "dailyThoughts",
    dailyThoughts: "dailyThoughts",
    article: "news",
    podcast: "podcasts",
    video: "videos",
    thoughts: "dailyThoughts",
    articles: "news",
    news: "news",
    podcasts: "podcasts",
    videos: "videos"
  },
  postKeyFields: {
    thought: "dailyThoughtID",
    dailyThoughts: "dailyThoughtID",
    article: "newsID",
    podcast: "podcastID",
    video: "videoID",
    thoughts: "dailyThoughtID",
    articles: "newsID",
    news: "newsID",
    podcasts: "podcastID",
    videos: "videoID"
  }
};

// https://us-central1-glp-corporate.cloudfunctions.net/
// http://localhost:5000/glp-test/us-central1/
// http://localhost:5000/glp-test/us-central1/m13-unsubscribeUsers?email=cmwakio@gmail.com&type=posts
