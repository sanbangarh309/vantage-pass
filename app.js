var express = require('express');
var session = require('express-session')
var app = express();
var db = require('./db');
app.set('view engine', 'ejs');
app.use(session({secret: 'bangarh',resave: true,
    saveUninitialized: true}));
// var user = require('./api/models/VantageModel');

var UploadController = require('./controllers/UploadController');
app.use('/upload', UploadController);

var AdminController = require('./admin/controllers/AdminController');
app.use('/admin', AdminController);

// var ChatController = require('./admin/controllers/ChatController');
// app.use('/chats', ChatController);

var UserController = require('./controllers/UserController');
app.use('/users', UserController);

app.use(express.static(__dirname + '/public'));

var EventController = require('./controllers/EventController');
app.use('/events', EventController);

var ModelController = require('./controllers/ModelController');
app.use('/models', ModelController);

var AuthController = require('./auth/AuthController');
app.use('/api/auth', AuthController);

/* Get get Countries */
app.get('/cntry', function(req,res){
  var countries = require ('countries-cities').getCountries();
  res.json(countries);
});
/* Get get Country Cities */
app.get('/cities', function(req,res){
  var country = req.query.cntry;
  var cities = require ('countries-cities').getCities(country);
  res.json(cities);
});


 var routes = require('./admin/routes/VantageRoutes');
 routes(app);

module.exports = app;