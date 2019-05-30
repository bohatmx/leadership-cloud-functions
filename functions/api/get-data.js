const functions = require('firebase-functions');
const admin = require('firebase-admin');

module.exports = function (){

    this.all = function(tblref, limit, response){
        
        admin.database().ref(tblref).limitToLast(limit).once('value').then(function(data){
            var tblres = data.val();
            if(tblres){
                response.status(200).json({"code": "200", "status": "Success","data": tblres});
            }
            else{
                response.status(400).json({"code": "400", "status": "Failure", "message": "No record(s) found."})
            }
        });
    }

    this.filtered = function(tblref, colref, colval, limit, response){
        admin.database().ref(tblref).orderByChild(colref).equalTo(colval).limitToLast(limit).once('value').then(function(data){
            var tblres = data.val();

            if(tblres){
                response.status(200).json({"code": "200", "status": "Success","data": tblres });
            }
            else{
                response.status(400).json({"code": "400", "status": "Failure", "message": "No record(s) found 1. "+tblref+" col: "+colref+" colval: "+colval})
            }
        });
    }

    this.id = function(tblref, id, response){
        admin.database().ref(tblref+'/'+id).once('value').then(function(data){
            var tblres = data.val();

            if(tblres){
                response.status(200).json({"code": "200", "status": "Success","data": tblres });
            }
            else{
                response.status(400).json({"code": "400", "status": "Failure", "message": "No record(s) found."})
            }
        });
    }

    this.generic = function(genericPath, response){
        admin.database().ref(genericPath).once('value').then(function(data){
            var tblres = data.val();

            if(tblres){
                response.status(200).json({"code": "200", "status": "Success","data": tblres });
            }
            else{
                response.status(400).json({"code": "400", "status": "Failure", "message": "No record(s) found."})
            }
        });
    }
}