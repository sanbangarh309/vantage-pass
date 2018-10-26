var mongoose = require('mongoose');

var VenueSchema = new mongoose.Schema({ 
  buisness_id: {type: String,required: true },
  venue_name:String,
  lat:String,
  lng:String,
  address:String,
  location:String,
  venue_image : String,
  description : String,
  website : String,
  phone : String,
  country : String,
  country_code : String,
  timezones:[],
  city : String,
  views : { type: Number, default: 0 },
  no_offers : { type: Number, default: 0 },
  reservation_counts : { type: Number, default: 0 },
  checkins_counts : { type: Number, default: 0 },
  cancellation_counts : { type: Number, default: 0 },
  created_date:{ type: Date, default: Date.now }
});
mongoose.model('Venue', VenueSchema);
module.exports = mongoose.model('Venue');