var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');


var multer  = require('multer');
var uploads = multer({ dest: './uploads/buisness/' });
var profile_image = uploads.fields([{name: 'profile_image', maxCount: 1}]);
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('./User');
var Model = require('./Model');
var Upload = require('./Upload');
var sanban = require('../functions');
var path = 'http://work4brands.com:4200/files/buisness/';

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send("User: "+ user.business_email +" was deleted.");
    });
});
// UPDATES PASSWORD
router.put('/change_pwd', function (req, res) {
    if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 8);
        User.findOneAndUpdate({ "_id": req.body.user_id }, { "$set": { "password": req.body.password}}).exec(function(err, user){
           if(err) {
               console.log(err);
               res.status(500).send(err);
           } else {
                    res.status(200).send(user);
           }
        });
 }  
});
// UPDATES A SINGLE USER IN THE DATABASE
router.put('/update', function (req, res) {
    if (!req.body.password) {
        User.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, user) {
            if (err) return res.status(500).send("There was a problem updating the user.");
            res.status(200).send(user);
        });
    } 
});

/* Buisness Dashboard */
// router.get('/dashboard', function (req, res) {
//     var busid = req.query.business_id;
//     sanban.sanBusinessUsers(req, res, busid, function(dashboard) {
//         res.status(200).send(dashboard);
//     });
// });

/* Locations */
router.get('/locations', function (req, res) { console.log(req.query.business_id);
    sanban.sanGetVenues(req, res,req.query.business_id, function(venues) {
        res.status(200).send(venues);
    });
});

//Delete Users
router.get('/delete_users', function (req, res) {
    User.remove({}, function (err, uploads) {
            if (err) return res.status(500).send(err);
            res.status(200).send(uploads);
        });
});

/* Update User Profile Image */
router.post('/profile', function (req, res) {
  profile_image(req,res,function(err) {
        if (req.body.image) {
            Upload.find({user_id:req.body.user_id,type:'profile_image'}, function (err, upload) {
                if (err) return res.status(500).send("There was a problem finding the users.");
                if (!upload || upload.length <=0 ){
                    Upload.create({
                        user_id : req.body.user_id,
                        name : req.files.profile_image[0].filename,
                        path : req.files.profile_image[0].path,
                        mimetype : req.files.profile_image[0].mimetype,
                        type : 'profile_image'
                      },
                      function (err, upload) {
                        if (err) return res.status(500).send("Error");
                        upload.path = path+upload.name;
                        User.update({_id: upload.user_id}, {
                            profile_image: upload.path
                        }, function(err, affected, resp) {
                           console.log(resp);
                        });
                        res.status(200).send(upload);
                      });
                }else{
                    Upload.update({user_id: req.body.user_id},{
                                $set: {'name': req.files.profile_image[0].filename,'path': req.files.profile_image[0].path,'mimetype': req.files.profile_image[0].mimetype} },{multi: true}, function(err, count) {
                         });
                        User.update({_id: upload.user_id}, {
                            profile_image: req.files.profile_image[0].filename
                        }, function(err, affected, resp) {
                           console.log(resp);
                        });
                    Upload.find({user_id:req.body.user_id,type:'profile_image'}, function (err, upload) {
                        if (err) return res.status(500).send("There was a problem finding the users.");
                        if (!upload && upload.length <= 0) return res.status(500).send("No Upload Found.");
                                Object.keys(upload).forEach(function(key) {
                                    if (upload[key].name) {
                                        upload[key].path = path+upload[key].name;
                                    }
                                });
                        res.status(200).send(upload);
                    }).sort( { _id: -1 } );
                    // Upload.update({user_id: req.body.user_id}, {
                    //     name: req.files.profile_image[0].filename,
                    //     path: req.files.profile_image[0].path, 
                    //     mimetype : req.files.profile_image[0].mimetype
                    // }, function(err, affected, resp) {
                    //     if (req.files.profile_image[0].filename) {
                    //             resp.path = path+req.files.profile_image[0].filename;
                    //         }
                    //    res.status(200).send(resp);
                    // })
                } 
            }).sort( { _id: -1 } );
        
        }else{
           Upload.find({user_id:req.body.user_id}, function (err, upload) {
                if (err) return res.status(500).send("There was a problem finding the users.");
                if (!upload && upload.length <= 0) return res.status(500).send("No Upload Found.");
                        Object.keys(upload).forEach(function(key) {
                            if (upload[key].name) {
                                upload[key].path = path+upload[key].name;
                            }
                        });
                res.status(200).send(upload);
            }).sort( { _id: -1 } );
        }
        if(err) {
            return res.end("Error uploading file.");
        }
    });
});

/* List of countries with image and country_name
 */
// router.get('/cntry_models', function(req,res){
//   User.find({}).exec(function(err, results) {
//     var countries = [];
//         Object.keys(results).forEach(function(key) {
//             if (results[key].country) {
//                 var countries = {
//                     name: results[key].country,
//                     image: ''
//                 };
//               console.log(results[key].country);
//             }else{
//                 myArray.splice(key, 1);
//             }
//         });
//         res.status(200).send(countries);
//   });
// });

module.exports = router;