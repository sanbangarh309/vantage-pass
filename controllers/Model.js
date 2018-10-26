var mongoose = require('mongoose');
var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};
var ModelSchema = new mongoose.Schema({  
  first_name:String,
  last_name:String,
  email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
  dob:{ type: Date, default: Date.now },
  current_agency:String,
  mother_agency:String,
  instagram_username:String,
  height:String,
  bust:String,
  waist:String,
  hips:String,
  shoes: String,
  eyes : String,
  hair : String,
  image : String,
  password : String,
  status : Number,
  block : Number,
  suspend_duration : String,
  profile_image : String,
  login_type : String,
  polaroids : String,
  composite_card_images : String,
  created_date:{ type: Date, default: null },
  suspend_date:{ type: Date, default: null },
  approved_date:{ type: Date, default: null }
});
mongoose.model('Model', ModelSchema);
module.exports = mongoose.model('Model');
