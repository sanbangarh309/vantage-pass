var mongoose = require('mongoose');
var subahbhoj = new mongoose.Schema({
   offer_value : { type: Number, default: '0' },
   dress_code : { type: String, default: '' },
   details : { type: String, default: '' },
   time : { type: String, default: '00:00-00:00' }
},{ _id : false });

var dopahrbhoj = new mongoose.Schema({
   offer_value : { type: Number, default: '0' },
   dress_code : { type: String, default: '' },
   details : { type: String, default: '' },
   time : { type: String, default: '00:00-00:00' }
},{ _id : false });

var ratribhoj = new mongoose.Schema({
   offer_value : { type: Number, default: '0' },
   dress_code : { type: String, default: '' },
   details : { type: String, default: '' },
   time : { type: String, default: '00:00-00:00' }
},{ _id : false });



var EventSchema = new mongoose.Schema({ 
  business_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true}, 
  image: String,
  name:String,
  venue_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Venue'},
  booking_model_ids: { type: String, default: '' },
  checkins_model_ids: { type: String, default: '' },
  start_date:{ type: Date, default: null },
  end_date:{ type: Date, default: null },
  distance:String,
  dress_code:String,
  details:String,
  lat:String,
  lng:String,
  reservation_count:Number,
  checkins_count:Number,
  day_limit:Number,
  week_limit:Number,
  available_hrs:Number,
  cncl_hrs:Number,
  views : Number,
  reservation_id:String,
  status:String,
  category:String,
  activity_type:[],
  qrcode:String,
  reserve_status:String,
  spots:Number,
  type : String,
  created_date:{ type: Date, default: null },
});
mongoose.model('Event', EventSchema);
module.exports = mongoose.model('Event');
