const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');

module.exports = function (){

    // Update data
    this.patch = function(name, id, body, response){
        // set tbl ref
        var dbref;
        if(name === "users") {
            dbref = name;
            var dbref2 = "user"
        }
        else dbref = config.endpoints[name];
        
        if(dbref == undefined){
            response.status(400).json({"code": "400", "status": "Failure","message":"Unavailable endpoint! Please check the api endpoint you are updating."});
            return;
        }

        if(id === undefined || id === null){
            response.status(400).json({"code": "400", "status": "Failure","message":"Unavailable ID field! Please check the id you are posting to."});
            return;
        }

        var updates = {};
        const entries = Object.entries(body);
        for (const [key, value] of entries) {
            if(name === "users") {
                updates[`${dbref}/${id}/` + key] = value;
                updates[`${dbref2}/${id}/` + key] = value;
            }else{
                updates[`${dbref}/${id}/` + key] = value;
            }
        }

        admin.database().ref().update(updates, function (error) {
            if (error) {
                response.status(400).json({"code": "400", "status": "Failure", "message": `${error.message}`})
                return;
            } else {
                response.status(200).json({"code": "200", "status": "Success","payload": `Successfully updated ${name} for ${id}`});
                return;
            }
        });

        

    }

}