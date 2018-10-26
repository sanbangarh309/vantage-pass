var express = require('express');

var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('../controllers/User');
var Model = require('../controllers/Model');
var multer  = require('multer');
var upload = multer({ dest: './uploads/buisness/' });
var sanUpload = upload.fields([{ name: 'profile_image', maxCount: 1 }]);
// User.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');
var VerifyToken = require('./VerifyToken');
var sanban = require('../functions');
/* Register A User */
router.post('/register',sanUpload, function(req, res) {
      var path = 'http://'+req.headers.host+'/files/buisness/';
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
      /* Mail Options */
      var mailOptions = {
        from: 'sandeep.digittrix@gmail.com',
        to: req.body.business_email,
        subject: 'Vantage Login Credentials',
        text: '<div><b><font style="font-family:tahoma;font-size:8pt">Your Login Credentials are:<br>------------------------------<br>Email: <b>'+ req.body.business_email+'</b><br>Password: <b>'+randomstring+'</b><br>-----------------------------<br></font></b></div>'
      };
      if (req.body.add_from_admin) {
        var bus_status = 1;
      }else{
        var bus_status = 0;
      }
      sanban.sanSendMail(req, res, mailOptions);
      User.create({
        business_name : req.body.name,
        business_email : req.body.business_email,
        website : req.body.website,
        country : req.body.country,
        city : req.body.city,
        facebook_url : req.body.facebook_url ? req.body.facebook_url : '',
        instagram : req.body.instagram ? req.body.instagram : '',
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        personal_email : req.body.personal_email,
        phone_no : req.body.phone_no,
        password : hashedPassword,
        status : bus_status,
        created_date : new Date(),
        profile_image : newpath,
        login_type : 'business'
      },
      function (err, user) {
        if (err) return res.status(401).send({ auth: false, token: null });
        // create a token
        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        if (req.body.add_from_admin) {
            return res.redirect('/admin/business?add=1');
        }else{
            res.status(200).send({id: user._id, auth: true, token: token ,pwd: hashedPassword,status: user.status});
        }
      });
});

/* Authenticate  User */
router.get('/profile',VerifyToken, function(req, res) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    User.findById(decoded.id,{ password: 0 }, function (err, user) {
	  if (err) return res.status(500).send("There was a problem finding the user.");
	  if (!user) return res.status(404).send("No user found.");
	  
	  res.status(200).send(user);
	});
    //res.status(200).send(decoded);
  });
});

/* Login User */
router.post('/login', function(req, res) {
// res.json(req.query);
    var usertype = []; 
    User.findOne({ business_email: req.body.email}, function (err, user) {
    if (err) return res.status(500).send(res);
    if (!user){ //console.log("heyy");
      Model.findOne({ email: req.body.email}, function (err, user) {
        if (err) return res.status(500).send('Error on the server.');
        if (!user) return res.status(404).send('No user found.');

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        var token = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ id: user._id,login_type: user.login_type, auth: true, token: token });
        return true;
      });
    } //return res.status(404).send('No user found.');
    if (user) {
            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        if (user.status ==1) {
            var token = jwt.sign({ id: user._id }, config.secret, {
              expiresIn: 86400 // expires in 24 hours
            });
            res.status(200).send({ id: user._id,login_type: user.login_type, auth: true, token: token });
        }else{
            return res.status(401).send({ result: 'not approved'});
        }
        
    }

  });
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});
module.exports = router;