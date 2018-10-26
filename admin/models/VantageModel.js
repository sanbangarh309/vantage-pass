'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSignup = new Schema({
  business_name:String,
  website:String,
  business_email:String,
  country:String,
  city:String,
  facebook_url:String,
  instagram:String,
  first_name:String,
  last_name:String,
  personal_email:String,
  phone_no:String,
  img: { data: Buffer, contentType: String },

  Created_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: [{
      type: String,
      enum: ['pending', 'ongoing', 'completed']
    }],
    default: ['completed']
  }
});

var image = new Schema({
    img: { data: Buffer, contentType: String }
});
module.exports = mongoose.model('Image', image);

module.exports = mongoose.model('VantageDb', UserSignup);