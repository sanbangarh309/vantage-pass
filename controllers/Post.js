var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({ 
  model_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Model',required: true}, 
  title: String,
  location:String,
  tag:String,
  post_image:String,
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Post', PostSchema);
module.exports = mongoose.model('Post');
