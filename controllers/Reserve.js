var mongoose = require('mongoose');

var ReserveSchema = new mongoose.Schema({ 
  model_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Model',required: true}, 
  event_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Event',required: true},
  venue:{type: mongoose.Schema.Types.ObjectId, ref: 'Venue'},
  reserve_activity : { type: String, default: '' },
  status : String,
  cancelled_by : String,
  qrcode_image : String,
  cancelled_date : { type: Date, default: null },
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Reserve', ReserveSchema);
module.exports = mongoose.model('Reserve');
