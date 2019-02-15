const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');

module.exports = function (){

    // Delete data
    this.delete = function(name, id, body, response){
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

        if(!body.uid){
            response.status(400).json({"code": "400", "status": "Failure","message":"Invalid user id."});
            return;
        }

        if(!body.uid.trim()){
            response.status(400).json({"code": "400", "status": "Failure","message":"Invalid user id."});
            return;
        }

        var updates = {};
        if(name === "users") {
            updates[`${dbref}/${id}`] = null;
            updates[`${dbref2}/${id}`] = null;
        }else{
            updates[`${dbref}/${id}`] = null;
        }

        admin.database().ref().update(updates, function (error) {
            if (error) {
                response.status(400).json({"code": "400", "status": "Failure", "message": `${error.message}`})
                return;
            } else {
                response.status(200).json({"code": "200", "status": "Success","payload": `Successfully deleted ${name} for ${id}`});
                return;
            }
        });

        

    }

}