'use strict';

var mongoose = require('mongoose'),
  VanUserObj = mongoose.model('VantageDb');
  var Image = mongoose.model('Image');
/* List All Users */
exports.listUsers = function(req, res) {
  VanUserObj.find({}, function(err, detail) {
    if (err)
      res.send(err);
    res.json(detail);
  });
};

// List Countries
exports.listCountries = function(req, res) {
  var countries = require ('countries-cities').getCountries();
  res.json(countries);
   //console.log(  );
};

// List Cities
exports.listCities = function(req, res) {
  var cntry = req.body.cntry;
  var cities = require ('countries-cities').getCities(cntry);
  res.json(cities);
};

/* Create New User */
exports.createUser = function(req, res) {
  var new_user = new VanUserObj(req.body);
  new_user.save(function(err, detail) {
    if (err)
      res.send(err);
    res.json(detail);
  });
};

/* Upload Image */
// exports.uploadImage = function(req, res) {
//   var fs = require('fs');
//   var path = require('path');
//   var formidable = require("formidable");
//   var appDir = path.dirname(require.main.filename);
//    var form = new formidable.IncomingForm();
//       form.parse(req, function (err, fields, files) {
//         var oldpath = files.img.path;
//         var newpath = appDir+'/images/' + files.img.name;
//         fs.rename(oldpath, newpath);
//         res.json("done");
//    });
// };



/* List Single User */
exports.listImage = function(req, res) {
  Image.findById(req.params.fileid, function(err, detail) {
    if (err)
      res.send(err);
    res.json(detail);
  });
};

/* List Single User */
exports.listSingleUser = function(req, res) {
  VanUserObj.findById(req.params.userId, function(err, detail) {
    if (err)
      res.send(err);
    res.json(detail);
  });
};

/* Update User */
exports.updateUser = function(req, res) {
  VanUserObj.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true}, function(err, detail) {
    if (err)
      res.send(err);
    res.json(detail);
  });
};

/* Delete User */
exports.deleteUser = function(req, res) {
  VanUserObj.remove({
    _id: req.params.userId
  }, function(err, detail) {
    if (err)
      res.send(err);
    res.json({ message: 'User successfully deleted' });
  });
};