# set functions GOOGLE_APPLICATION_CREDENTIALS

# ========================================================

export GOOGLE_APPLICATION_CREDENTIALS="functions/service/glp-test-firebase-adminsdk-58xlx-84586619f2.json";

export GOOGLE_APPLICATION_CREDENTIALS="functions/service/leadershipplatform-158316-firebase-adminsdk-goitz-f99dd5b92d.json";

# set project id

# ==================

# live server

functions config set projectId leadershipplatform-158316

# test server

functions config set projectId glp-test

# start functions

functions start

# stop functions

functions stop

# kill functions

functions kill

# deploy functions

firebase deploy --only functions

# deploy single function

firebase deploy --only functions:{functionName}

# serve functions

firebase serve --only functions

# execute functions locally e.g.

# ==================================

# http://{server}/{projectId}/us-central1/{functionName}

http://localhost:5000/glp-test/us-central1/m45-sendUnsentMails  

http://localhost:5000/leadershipplatform-158316/us-central1/m06-updateFollowers
