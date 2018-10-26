var express = require('express');
var multer  = require('multer');
var uploads = multer({ dest: './uploads/models/' });
var profile_image = uploads.fields([{name: 'profile_image', maxCount: 1}]);
// var sanUpload = uploads.fields([{name: 'composite_card_frontimage', maxCount: 1}, {name: 'composite_card_backimage', maxCount: 1}]);
// var card_frontimage = uploads.fields([{name: 'composite_card_frontimage', maxCount: 1}]);
// var card_backimage = uploads.fields([{name: 'composite_card_backimage', maxCount: 1}]);
var multiupload = uploads.array('polaroids',5);
var composite_card = uploads.array('composite_card_images',3);
var router = express.Router();
var Upload = require('./Upload');
var Model = require('./Model');
// var User = require('../controllers/User');
// var Model = require('../controllers/Model');
// var path = 'http://work4brands.com/vantage/uploads/models/';
var path = 'http://work4brands.com:4200/files/models/';

/* Upload Photos */
router.post('/upload_photos', function (req, res) {
  var multiarray = [];
  //res.status(200).send(req.body);
    multiupload(req,res,function(err) {
        var model_id = req.body.model_id;

        //console.log(req.files);
        Object.keys(req.files).forEach(function(key) {
            if (req.files[key] !='') {
              multiarray.push(req.files[key].filename);
              // Upload.create({
              //   user_id : req.body.model_id,
              //   name : req.files[key].filename,
              //   path : req.files[key].path,
              //   mimetype : req.files[key].mimetype,
              //   type : 'polaroids'
              // },
              // function (err, upload) {
              //   if (err) return res.status(500).send("Error")
              //   multiarray.push(upload);
              // });
            }
        });
        if(err) {
            return res.end(err);
        }
        Model.findByIdAndUpdate(req.body.model_id, { $set: { "polaroids": multiarray.join(',')}}, function(err, models){
          res.status(200).send({ result: 'uploaded'});
        });
    });
});

router.post('/upload_single', function (req, res) {
  var multiarray = [];
  composite_card(req,res,function(err) {
        var model_id = req.body.model_id;
        if (req.files && req.files!= undefined) {
            Object.keys(req.files).forEach(function(key) {
              if (req.files[key] !='') {
                if (key ==0) {
                  var type= 'frontimage';
                }else{
                  var type= 'backimage';
                }
                multiarray.push(req.files[key].filename+type);
                // Upload.create({
                //   user_id : req.body.model_id,
                //   name : req.files[key].filename,
                //   path : req.files[key].path,
                //   mimetype : req.files[key].mimetype,
                //   type : type 
                // },
                // function (err, upload) {
                //   if (err) return res.status(500).send("Error")
                //   multiarray.push(upload);
                // });
              }
          });
          if(err) {
              return res.end(err);
          }
          Model.findByIdAndUpdate(req.body.model_id, { $set: { "composite_card_images": multiarray.join(',')}}, function(err, models){
            res.status(200).send({ result: 'uploaded'});
          });
          
        }
    });
    // card_frontimage(req,res,function(err){
    //   if (req.files && req.files.composite_card_frontimage != undefined) {
    //     Upload.create({
    //                 user_id : req.body.model_id,
    //                 name : req.files.composite_card_frontimage[0].filename,
    //                 path : req.files.composite_card_frontimage[0].path,
    //                 mimetype : req.files.composite_card_frontimage[0].mimetype,
    //                 type : 'frontimage'
    //     },
    //     function (err, upload) {
    //         if (err) return res.status(500).send("Error")
    //             multiarray.push(upload);
    //     });
    //   }     
    //   if(err) {
    //     return res.end("Error uploading file.");
    //   }
    // });

    // card_backimage(req,res,function(err){
    //   if (req.files && req.files.composite_card_backimage != undefined) {
    //     Upload.create({
    //             user_id : req.body.model_id,
    //             name : req.files.composite_card_backimage[0].filename,
    //             path : req.files.composite_card_backimage[0].path,
    //             mimetype : req.files.composite_card_backimage[0].mimetype,
    //             type : 'backimage'
    //     },
    //     function (err, upload) {
    //           if (err) return res.status(500).send("Error")
    //           multiarray.push(upload);
    //     });
    //   }
    //   if(err) {
    //     return res.end("Error uploading file.");
    //   }
    // });
    // sanUpload(req,res,function(err) {
    //     //console.log(req.body);
    //     if (req.files.composite_card_frontimage) {
    //       Upload.create({
    //             user_id : req.body.model_id,
    //             name : req.files.composite_card_frontimage[0].filename,
    //             path : req.files.composite_card_frontimage[0].path,
    //             mimetype : req.files.composite_card_frontimage[0].mimetype,
    //             type : 'frontimage'
    //           },
    //           function (err, upload) {
    //             if (err) return res.status(500).send("Error")
    //             multiarray.push(upload);
    //       });
    //     }
    //     if (req.files.composite_card_backimage) {
    //       Upload.create({
    //             user_id : req.body.model_id,
    //             name : req.files.composite_card_backimage[0].filename,
    //             path : req.files.composite_card_backimage[0].path,
    //             mimetype : req.files.composite_card_backimage[0].mimetype,
    //             type : 'backimage'
    //           },
    //           function (err, upload) {
    //             if (err) return res.status(500).send("Error")
    //             multiarray.push(upload);
    //       });
    //     }
        
    //     if(err) {
    //         return res.end("Error uploading file.");
    //     }
    //     res.status(200).send({ result: 'uploaded'});
    // });
});

// RETURNS ALL THE images IN THE DATABASE
router.get('/model_images', function (req, res) {
        Upload.find({}, function (err, uploads) {
            if (err) return res.status(500).send("There was a problem finding the users.");
            res.status(200).send(uploads);
        }).sort({_id:-1});
});

//Delete all
router.get('/delete_uploads', function (req, res) {
    Upload.remove({}, function (err, uploads) {
            if (err) return res.status(500).send(err);
            res.status(200).send(uploads);
        });
});

module.exports = router;