var mongoose = require('mongoose');

var UploadSchema = new mongoose.Schema({ 
  user_id: String, 
  name: String,
  path:String,
  mimetype:String,
  type :String,
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Upload', UploadSchema);
module.exports = mongoose.model('Upload');