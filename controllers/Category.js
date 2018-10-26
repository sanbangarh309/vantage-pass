var mongoose = require('mongoose');

var CatSchema = new mongoose.Schema({ 
  event_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'}, 
  title: String,
  detail:String,
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Category', CatSchema);
module.exports = mongoose.model('Category');
