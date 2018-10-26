var mongoose = require('mongoose');
var Promise = require('bluebird');
Promise.promisifyAll(mongoose);
mongoose.connect('mongodb://localhost:27017/vantage_api');