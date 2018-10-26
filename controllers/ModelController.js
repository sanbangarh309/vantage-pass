var express = require('express');

var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Model = require('./Model');
var Upload = require('./Upload');
var Post = require('./Post');

var multer  = require('multer');
var uploads = multer({ dest: './uploads/models/' });
var uploadss = multer({ dest: './uploads/posts/' });
var profile_image = uploads.fields([{name: 'profile_image', maxCount: 1}]);
var post_image = uploadss.fields([{name: 'post_image', maxCount: 1}]);
// User.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var VerifyToken = require('../auth/VerifyToken');
var sanban = require('../functions');


/* Register A User */
router.post('/register',profile_image, function(req, res) {
    var path = 'http://'+req.headers.host+'/files/models/';
      if (req.files && req.files.profile_image != undefined) {
        var parts = req.files.profile_image[0].mimetype.split("/"),
        ext = parts[1];
        var imgfilename = req.files.profile_image[0].filename+'.'+ext;
      }
      if (imgfilename ==undefined) {
          var newpath = '';
      }else{
          var newpath = path+imgfilename;
      }
        var randomstring = Math.random().toString(36).slice(-8);
        
        var hashedPassword = bcrypt.hashSync(randomstring, 8);
       
      var mailOptions = {
        from: 'sandeep.digittrix@gmail.com',
        to: req.body.email,
        subject: 'Vantage Login Credentials',
        text: '<div><b><font style="font-family:tahoma;font-size:8pt">Your Login Credentials are:<br>------------------------------<br>Email: <b>'+ req.body.email+'</b><br>Password: <b>'+randomstring+'</b><br>-----------------------------<br></font></b></div>'
      };
      sanban.sanSendMail(req, res, mailOptions);
      Model.create({
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        dob : new Date(req.body.dob),
        current_agency : req.body.current_agency,
        mother_agency : req.body.mother_agency,
        instagram_username : req.body.instagram_username,
        height : req.body.height,
        bust : req.body.bust,
        waist : req.body.waist,
        hips : req.body.hips,
        shoes : req.body.shoes,
        eyes : req.body.eyes,
        hair : req.body.hair,
        password : hashedPassword,
        login_type : 'model',
        profile_image : newpath,
        created_date : new Date(),
        status : 0,
        block : 0
      },
      function (err, user) { 
        if (err) return res.status(500).send("Email Already Exist.")
        if (req.body.add_from_admin) {
            return res.redirect('/admin/models?add=1');
        }else{
            var token = jwt.sign({ id: user._id }, config.secret, {
              expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ id: user._id, auth: true, token: token, pwd: randomstring });
        }  
      });
});

/* Update User Profile Image */
router.post('/profile', function (req, res) {
  var path = 'http://'+req.headers.host+'/files/models/';
  profile_image(req,res,function(err) {
        if (req.body.image) {
            Upload.find({user_id:req.body.user_id,type:'profile_image'}, function (err, upload) {
                if (err) return res.status(500).send({ status: false,detail: error});
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
                        Model.update({_id: upload.user_id}, {
                            profile_image: req.files.path+profile_image[0].filename
                        }, function(err, affected, resp) {
                           console.log(resp);
                        });
                        res.status(200).send(upload);
                      });
                }else{
                    Upload.update({user_id: req.body.user_id}, {
                        name: req.files.profile_image[0].filename,
                        path: req.files.profile_image[0].path, 
                        mimetype : req.files.profile_image[0].mimetype
                    }, function(err, affected, resp) {
                        if (resp && resp.name) {
                                resp.path = path+resp.name;
                            }
                        Model.update({_id: resp.user_id}, {
                            profile_image: path+resp.path
                        }, function(err, affected, resp) {
                           console.log(resp);
                        });
                       res.status(200).send(resp);
                    })
                } 
            }).sort( { _id: -1 } );
        
        }else{
           Upload.find({user_id:req.body.user_id}, function (err, upload) {
                if (err) return res.status(500).send({ status: false,detail: error});
                if (!upload && upload.length <= 0) return res.status(500).send({ status: false,detail: error});
                        Object.keys(upload).forEach(function(key) {
                            if (upload[key].name) {
                                upload[key].path = path+upload[key].name;
                            }
                        });
                res.status(200).send(upload);
            }).sort( { _id: -1 } );
        }
        if(err) {
            return res.end({ status: false,detail: error});
        }
    });
});

/* Login User */
router.post('/login', function(req, res) {
    Model.findOne({ email: req.body.email}, function (err, user) {
    if (err) return res.status(500).send({ status: false,detail: error});
    if (!user) return res.status(404).send({ status: false,detail: error});

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token });
  });
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
    var type = req.query.type;
    var user_id = req.query.user_id;
        Model.find({status:'1',block:'0'}, function (err, users) {
            if (err) return res.status(500).send({ status: false,detail: error});
            res.status(200).send(users);
        });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
    Model.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send({ status: false,detail: error});
        res.status(200).send("User: "+ user.last_name +" was deleted.");
    });
});

// UPDATES PASSWORD
router.put('/change_pwd', function (req, res) {
    if (req.body.password) {
          req.body.password = bcrypt.hashSync(req.body.password, 8);
          console.log(req.body.password);
          Model.findOneAndUpdate({ "_id": req.body.user_id }, { "$set": { "password": req.body.password}}).exec(function(err, user){
             if(err) {
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
        Model.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, user) {
            if (err) return res.status(500).send("There was a problem updating the user.");
            res.status(200).send(user);
        });
    } 
});


//Delete Models
router.get('/delete_modals', function (req, res) {
    Model.remove({}, function (err, uploads) {
            if (err) return res.status(500).send(err);
            res.status(200).send(uploads);
        });
});

/* Model Dashboard */
router.get('/dashboard', function (req, res) {
    // var busid = req.query.model_id;
    sanban.sanCountriesInfo(req, res, function(dashboard) {
        res.status(200).send(dashboard);
    });
});

/* Post By Model */
router.post('/addpost',post_image, function(req, res) {
    var path = 'http://'+req.headers.host+'/files/posts/';
    if (req.files.post_image != undefined) {
      var parts = req.files.post_image[0].mimetype.split("/"),
        ext = parts[1];
      var imgfilename = req.files.post_image[0].filename;
    }
    if (imgfilename ==undefined) {
        var newpath = '';
    }else{
        var newpath = path+imgfilename;
    }
      Post.create({
        model_id : req.body.model_id,
        title : req.body.title,
        location : req.body.location,
        tag : req.body.tag,
        post_image : newpath,
      },
      function (err, post) {
        if (err) return res.status(500).send({detail:'error'});
        res.status(200).send(post);
      });
});

router.get('/listposts',function(req,res){
    sanban.sanGetAllPosts(req,res ,req.query.model_id, function(posts){
        res.status(200).send(posts);
    });
});

module.exports = router;