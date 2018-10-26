var express = require('express');

var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Admin = require('./Admin');
var Model = require('../../controllers/Model');
var User = require('../../controllers/User');
var Event = require('../../controllers/Event');
var Venue = require('../../controllers/Venue');
var Category = require('../../controllers/Category');
var Upload = require('../../controllers/Upload');
var Country = require('../../controllers/Country');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: './uploads/buisness/' });
var sanUpload = upload.fields([{ name: 'profile_image', maxCount: 1 }]);

var uploads = multer({ dest: './uploads/models/' });
var uploadss = multer({ dest: './uploads/country/' });
var profile_image = uploads.fields([{name: 'profile_image', maxCount: 1}]);
var cntry_image = uploadss.fields([{name: 'cntry_image', maxCount: 1}]);
// Admin.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
var VerifyToken = require('../../auth/VerifyToken');
var sanban = require('../../functions');
var sess
// router.post('/register', function(req, res) {
//       var hashedPassword = bcrypt.hashSync(req.body.pwd, 8);
//       Admin.create({
//         username : req.body.name,
//         email : req.body.email,
//         password : hashedPassword
//       },
//       function (err, user) {
//         if (err) return res.status(401).send({ auth: false, token: null });

//         // create a token
//         var token = jwt.sign({ id: user._id }, config.secret, {
//           expiresIn: 86400 // expires in 24 hours
//         });

//         res.status(200).send({id: user._id, auth: true, token: token ,pwd: hashedPassword});
//       });
// });

router.put('/update', function (req, res) {
  if (!req.body.password) {
    Admin.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, user) {
      if (err) return res.status(500).send("There was a problem updating the user.");
      res.status(200).send(user);
    });
  } 
});
// sanUpload
router.post('/bupdate',sanUpload, function (req, res) {
  var image = req.body.old_image.substr(req.body.old_image.lastIndexOf('/') + 1)
  if (req.files.profile_image && req.files.profile_image != undefined) {
    fs.unlink(config.directory+'/uploads/buisness/'+image, function(err) {
       if(err && err.code == 'ENOENT') {
          console.info("File doesn't exist, won't remove it.");
       } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
            console.error("Error occurred while trying to remove file");
       } else {
            console.info(`removed`);
       }
    });
  }

  delete req.body.old_image;
  var path = 'http://work4brands.com:4200/files/buisness/';
  if (req.files.profile_image != undefined) {
    var parts = req.files.profile_image[0].mimetype.split("/"),
    ext = parts[1];
    var imgfilename = req.files.profile_image[0].filename+'.'+ext;
  }
  if (imgfilename ==undefined) {
    delete req.body.profile_image;
  }else{
    req.body.profile_image = path+imgfilename;
  }
  User.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, user) {
   if (err) return res.status(500).send("There was a problem updating the user.");
   return res.redirect('/admin/buisness?update=1');
 });
});

router.post('/mupdate',profile_image, function (req, res) {
  var image = req.body.old_image.substr(req.body.old_image.lastIndexOf('/') + 1);
  if (req.files.profile_image && req.files.profile_image != undefined) {
    fs.unlink(config.directory+'/uploads/models/'+image, function(err) {
      if(err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
              } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
              } else {
                console.info(`removed`);
              }
            });
  }
  delete req.body.old_image;
  var path = 'http://work4brands.com:4200/files/models/';
  if (req.files.profile_image != undefined) {
    var parts = req.files.profile_image[0].mimetype.split("/"),
    ext = parts[1];
    var imgfilename = req.files.profile_image[0].filename+'.'+ext;
  }
  if (imgfilename ==undefined) {
    var newpath = '';
    delete req.body.profile_image;
  }else{
    req.body.profile_image = path+imgfilename;
  }
  Model.findByIdAndUpdate(req.body.user_id, req.body, {new: true}, function (err, user) {
   if (err) return res.status(500).send("There was a problem updating the user.");
   return res.redirect('/admin/models?update=1');
 });
});

// router.get('/', function (req, res) {
//         Admin.find({}, function (err, users) {
//             if (err) return res.status(500).send("There was a problem finding the users.");
//             res.status(200).send(users);
//         });
// });

/* Authenticate  User */
// router.get('/profile',VerifyToken, function(req, res) {
//   var token = req.headers['x-access-token'];
//   if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

//   jwt.verify(token, config.secret, function(err, decoded) {
//     if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

//     Admin.findById(decoded.id,{ password: 0 }, function (err, user) {
// 	  if (err) return res.status(500).send("There was a problem finding the user.");
// 	  if (!user) return res.status(404).send("No user found.");

// 	  res.status(200).send(user);
// 	});
//     //res.status(200).send(decoded);
//   });
// });


/* Login User */
router.post('/login', function(req, res) {
  sess=req.session;
  Admin.findOne({ email: req.body.email}, function (err, user) {
    if (err) return res.status(500).send(res);
    if (!user) return res.status(404).send('No user found.');
    if (user) {
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

      var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
      sess.token = token;
      return res.redirect('/admin/home');
    }
  });
});
/* Logout*/
router.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    return res.redirect('admin/login');
  })
});

/* Approve*/
router.post('/approve_bus',function(req,res){
  var randomstring = Math.random().toString(36).slice(-8);
  var hashedPassword = bcrypt.hashSync(randomstring, 8);
  req.body.password = hashedPassword; 
  if (req.body.status ==1) {
    req.body.approved_date = new Date();
    req.body.block = 0;
  }else{
    req.body.approved_date = null;
  }
  var redirect = req.body.redirect;
  delete req.body.redirect;
  var decline = req.body.decline;
  delete req.body.decline;
  User.findByIdAndUpdate(req.body.business_id, req.body, {new: true}, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");
    if (req.body.status ==2 && decline) {
        var mailOptions = {
              from: 'sandeep.digittrix@gmail.com',
              to: user.email,
              subject: 'Your Account Is Declined',
              text: '<div><b><font style="font-family:tahoma;font-size:8pt">Reason For Declined:<br>'+req.body.decline+'</font></b></div>'
        };
        sanban.sanSendMail(req, res, mailOptions);
    }
    if (user.status ==1) {
      var mailOptions = {
        from: 'sandeep.digittrix@gmail.com',
        to: user.email,
        subject: 'Approved',
        text: '<div><b><font style="font-family:tahoma;font-size:8pt">Your Login Credentials are:<br>------------------------------<br>Email: <b>'+ user.email+'</b><br>Password: <b>'+randomstring+'</b><br>-----------------------------<br></font></b></div>'
      };
      sanban.sanSendMail(req, res, mailOptions);
    }
    if (redirect =='app') {
      return res.redirect('/admin/apps');
    }else{
      return res.redirect('/admin/buisness');
    }
  });
});

/* Approve*/
router.post('/approve',function(req,res){
  var randomstring = Math.random().toString(36).slice(-8);
  var hashedPassword = bcrypt.hashSync(randomstring, 8);
  req.body.password = hashedPassword; 
  if (req.body.status ==1) {
    req.body.approved_date = new Date();
    req.body.block = 0;
  }else{
    req.body.approved_date = null;
  }
  var redirect = req.body.redirect;
  delete req.body.redirect;
  Model.findByIdAndUpdate(req.body.model_id, req.body, {new: true}, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");
    if (user.status ==1) {
      var mailOptions = {
        from: 'sandeep.digittrix@gmail.com',
        to: user.email,
        subject: 'Approved',
        text: '<div><b><font style="font-family:tahoma;font-size:8pt">Your Login Credentials are:<br>------------------------------<br>Email: <b>'+ user.email+'</b><br>Password: <b>'+randomstring+'</b><br>-----------------------------<br></font></b></div>'
      };
      sanban.sanSendMail(req, res, mailOptions);
    }
    if (redirect =='app') {
      return res.redirect('/admin/apps');
    }else{
      return res.redirect('/admin/models');
    }
  });
});

/* Block*/
router.post('/block',function(req,res){
  var redirect = req.body.redirect;
  delete req.body.redirect;
  Model.findByIdAndUpdate(req.body.model_id, req.body, {new: true}, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");
    if (redirect =='app') {
      return res.redirect('/admin/apps');
    }else{
      return res.redirect('/admin/models');
    }
  });
});

/* Get Models */
router.post('/get_models',function(req,res){
  if (req.body.booking_model_ids.indexOf(',') != -1) {
    var bookings = req.body.booking_model_ids.split(",");
  }else{
    var bookings = req.body.booking_model_ids;
  }
  if (req.body.checkins_model_ids.indexOf(',') != -1) {
    var checkins = req.body.checkins_model_ids.split(",");
  }else{
    var checkins = req.body.checkins_model_ids;
  }
  Model.find( { _id: { $in : bookings }}, function(err, bookings){
    if (err) return res.status(500).send({result:'err'});
    var userdata = {
        bookings: bookings
    }
    if(!checkins){
      res.status(200).send(userdata);
    }else{
      Model.find( { _id: { $in : checkins }}, function(err, chckins){
        if (err) return res.status(500).send({result:'err'});
        var userdata = {
          bookings: bookings,
          checkins: chckins
        }
        res.status(200).send(userdata);
      });
    } 
  });
});

/* Delete Buisness Users */
router.post('/delete', function (req, res) {
  var redirect = req.body.redirect;
  delete req.body.redirect;
  User.findByIdAndRemove(req.body.business_id, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    var image = sanban.sanRemoveExt(user.profile_image.substr(user.profile_image.lastIndexOf('/') + 1));
         Upload.findOneAndRemove({user_id : user._id}, function (err,uploads){
            fs.unlink(config.directory+'/uploads/buisness/'+image, function(err) {
		       if(err && err.code == 'ENOENT') {
		          console.info("File doesn't exist, won't remove it.");
		       } else if (err) {
		                // other errors, e.g. maybe we don't have enough permission
		            console.error("Error occurred while trying to remove file");
		       } else {
		            console.info(`removed`);
		       }
           if (redirect =='app') {
              return res.redirect('/admin/apps');
           }else{
              return res.redirect('/admin/buisness');
           }
		    });
         });
      });
});

/* Delete Model Users */
router.post('/delete_model', function (req, res) {
  var redirect = req.body.redirect;
  delete req.body.redirect;
  Model.findByIdAndRemove(req.body.model_id, function (err, user) {
    if (err) return console.log(err);
         var image = sanban.sanRemoveExt(user.profile_image.substr(user.profile_image.lastIndexOf('/') + 1));
         Upload.findOneAndRemove({user_id : user._id}, function (err,uploads){
            fs.unlink(config.directory+'/uploads/models/'+image, function(err) {
		       if(err && err.code == 'ENOENT') {
		          console.info("File doesn't exist, won't remove it.");
		       } else if (err) {
		                // other errors, e.g. maybe we don't have enough permission
		            console.error("Error occurred while trying to remove file");
		       } else {
		            console.info(`removed`);
		       }
           if (redirect =='app') {
              return res.redirect('/admin/apps');
            }else{
              return res.redirect('/admin/models');
            }
		    });
         });
       });
});

/* Delete Event */
router.post('/delete_event', function (req, res) {
  var path = config.directory+'uploads/events/';
  Event.findByIdAndRemove(req.body.event_id, function (err, event) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    if (event.type=='event') {
      var filepath = path+event.event_image;
    }else if (event.type=='offer') {
      var filepath = path+event.offer_image;
    }
    if (fs.existsSync(filepath)) { 
      fs.unlink(filepath, function(error) {
        if (error) {
          throw error;
        }
        console.log('Deleted dog.jpg!!');
      });
    }
    if (event.type =='offer') {
      return res.redirect('/admin/offers');
    }else{
      return res.redirect('/admin/events');
    }
  });
});

/* Delete Buisness Users */
router.get('/delete_all', function (req, res) {
  User.remove({}, function (err, users) {
    if (err) return res.status(500).send(err);
    Upload.findOneAndRemove({user_id : new mongoose.mongo.ObjectID(users._id)}, function (err,uploads){
      fs.unlink(uploads.path, function(error) {
        if (error) {
          throw error;
        }
      });
    });
    return res.redirect('/admin/buisness');
  });
});

/* Delete All Events */
router.get('/delete_all_events', function (req, res) {
  Event.remove({}, function (err, uploads) {
    if (err) return res.status(500).send(err);
    return res.redirect('/admin/events');
  });
});

/* Add Country with timezone */
router.post('/add_cntry',cntry_image, function(req,res){
  var imgfilename = '';
  if (req.files.cntry_image != undefined) {
    var parts = req.files.cntry_image[0].mimetype.split("/"),
    ext = parts[1];
    imgfilename = req.files.cntry_image[0].filename+'.'+ext;
  }
  Country.create({
    name : req.body.cntry_name,
    timezone : req.body.timezone,
    image : imgfilename,
    delete : 0
  },
  function (err, countries) {
    if (err) return res.status(401).send({ result: 'error' });
    return res.redirect('/admin/countries');
        // res.status(200).send({ result: 'success' });
      });
});

/* Delete Country */
router.post('/delete_cntry', function (req, res) {
  Country.findByIdAndRemove(req.body.cntry_id, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    fs.unlink(config.directory+'/uploads/country/'+sanban.sanRemoveExt(user.image), function(error) {
      if (error) {
        throw error;
      }
    });
    return res.redirect('/admin/countries');
  });
});

/* Add Category */
router.post('/add_category',sanUpload, function(req,res){
  Category.create({
    title : req.body.name,
    detail : req.body.details
  },
  function (err, categories) {
    if (err) return res.status(401).send({ result: 'error' });
    return res.redirect('/admin/categories');
        // res.status(200).send({ result: 'success' });
  });
});

/* Delete Single Category */
router.post('/delete_category', function (req, res) {
  Category.findByIdAndRemove(req.body._id, function (err, user) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    return res.redirect('/admin/categories');
  });
});

/* Delete All Categories */
router.get('/delete_all_categories', function (req, res) {
  Category.remove({}, function (err, uploads) {
    if (err) return res.status(500).send(err);
    return res.redirect('/admin/categories');
  });
});
/* Delete Venue */
router.get('/delete_venue', function (req, res) {
  Venue.findByIdAndRemove(req.query.venue_id, function (err, venue) {
    if (err) return res.status(500).send("There was a problem deleting the user.");
    if (venue.venue_image) {
      fs.unlink(config.directory+'/uploads/venues/'+sanban.sanRemoveExt(venue.venue_image.substr(venue.venue_image.lastIndexOf('/') + 1)), function(error) {
        if (error) {
          throw error;
        }
      });
    }
    return res.redirect('/admin/venues');
  });
});

/* Edit Event */
router.post('/edit_booking', function(req,res){
  var type = req.query.type;
  Event.findByIdAndUpdate(req.body.event_id, req.body, {new: true}, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");
    if (type =='offer') {
      return res.redirect('/admin/offers');
    }else{
      return res.redirect('/admin/events');
    }
  });
});

/* Edit Event */
router.post('/changeStatus', function(req,res){
    Event.findByIdAndUpdate(req.body.event_id, req.body, {new: true}, function (err, event) {
      if (err) return res.status(500).send({result:'err'});
      res.status(200).send(event);
    });
  });

/* Change Cities */
router.post('/change_cities', function(req,res){ console.log(req.body);
  if (req.body.country) {
    var cities = require ('countries-cities').getCities(req.body.country);
    res.status(200).send(cities);
  }else{
    res.status(200).send({});
  }  
});

/* Update City */
router.post('/updateCity', function(req,res){
    if (req.body.city) {
      User.findByIdAndUpdate(req.body.id, req.body, {new: true}, function (err, user) {
        if (err) return res.status(500).send({result:'err'});
        res.status(200).send(user);
      }); 
    }
});
/* Update Venue */
router.post('/updateVenue', function(req,res){
  console.log(req.body);
    if (req.body.buisness_id) {
      Venue.findByIdAndUpdate(req.body.id, req.body, {new: true}, function (err, venue) {
        if (err) return res.status(500).send({result:'err'});
        res.status(200).send(venue);
      }); 
    }
});

/* Filter Models */
router.post('/filter_result', function(req,res){
  if (req.body.type =='approved') {
    Model.find({status:1}, function (err, models) {
      res.status(200).send(models);
    }).sort( { _id: -1 } );
  }else if (req.body.type =='blocked') {
    Model.find({block:1}, function (err, models) {
      res.status(200).send(models);
    }).sort( { _id: -1 } );
  }else{
    Model.find({}, function (err, models) {
      res.status(200).send(models);
    }).sort( { _id: -1 } );
  }
});

/* Filter Business */
router.post('/filter_resultt', function(req,res){
  if (req.body.type =='approved') {
    User.find({status:1}, function (err, users) {
      res.status(200).send(users);
    }).sort( { _id: -1 } );
  }else{
    User.find({}, function (err, users) {
      res.status(200).send(users);
    }).sort( { _id: -1 } );
  }
});
module.exports = router;