var mongoose = require('mongoose');
var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
var UserSchema = new mongoose.Schema({  
  business_name:String,
  website:String,
  business_email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
  country:String,
  city:String,
  facebook_url:String,
  instagram:String,
  first_name:String,
  last_name:String,
  personal_email:String,
  phone_no:String,
  password: String,
  status: Number,
  profile_image: String,
  login_type : String,
  venue : String,
  cities : [],
  created_date:{ type: Date, default: null },
  approved_date:{ type: Date, default: null }
});
mongoose.model('User', UserSchema);

// mongoose.connection.collections['User'].drop( function(err) {
//     console.log('collection dropped');
// });

module.exports = mongoose.model('User');
