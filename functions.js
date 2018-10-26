/**
 * @author Sandeep Bangarh <sanbangarh309@gmail.com>
 */
 "use strict"
 var Venue = require('./controllers/Venue'); 
 var Country = require('./controllers/Country');
 var User = require('./controllers/User');
 var Event = require('./controllers/Event');
 var config = require('./config');
 var https = require("https");
 var Model = require('./controllers/Model');
 var Reserve = require('./controllers/Reserve');
 var Promise = require('bluebird');
 var gcm = require('node-gcm');
 var sender = new gcm.Sender(config.API_KEY);
 var ObjectId = require('mongodb').ObjectID;
// const Geo = require('geo-nearby');
// var geolib = require('geolib');
var geodist = require('geodist');
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder(config.options);
var moment = require('moment');
module.exports = {
	sanImageUpload : function(req, res, id) {
		var fs = require('fs');
		var path = require('path');
		var formidable = require("formidable");
		var appDir = path.dirname(require.main.filename);
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, files) {
			if (files.img.name !='') {
				var oldpath = files.img.path;
				var newpath = appDir+'/uploads/' + files.img.name;
				fs.rename(oldpath, newpath);
				res.json(files.img.name);
			}else{
				res.json('failed');
			}

		});
	},

	sanGenerateQRCode : function(req, res,id, callback) {
		var qr = require('qr-image');
		var realpath = 'http://'+req.headers.host+'/files/qrcodes/'+ObjectId(id)+'.svg';
		var path = './uploads/qrcodes/'+ObjectId(id)+'.svg';
		var qr_svg = qr.image(ObjectId(id)+'san@#ban', { type: 'svg' });
		qr_svg.pipe(require('fs').createWriteStream(path));
		callback(realpath);
	},

	sanSendMessage : function(req, res, id) {
		var message = new gcm.Message({
			priority: 'high',
			contentAvailable: true,
			delayWhileIdle: true,
			timeToLive: 3,
			data: { key1: 'msg1', key2: 'message2'},
			notification: {
				title: "Hello, World",
				icon: "ic_launcher",
				body: "This is a notification that will be displayed if your app is in the background."
			}
		});
       // message.addData('key1','message1');
       var registrationTokens = [];
       registrationTokens.push('regToken1');
       sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
       	if (err) console.error(err);
       	else console.log(response);
       });
   },

   sanBusinessUsers : function(req, res, userid, callback) {
   	User.find({_id:userid}, function (err, user) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!user) return res.status(404).send("No user found.");
   		module.exports.sanGetEvents(req, res, user[0]._id, function(events) {
   			var userdata = { 
   				user: user,
   				events: events
   			};
   			callback(userdata);
   		}); 
   	}).sort( { _id: -1 } );
   },

   sanCountriesInfo : function (req, res, callback) {
   	var path = 'http://'+req.headers.host+'/files/flags/';
   	// User.find({}, function (err, users) {
   	// 	if (err) return res.status(500).send("There was a problem finding the events.");
   	// 	if (!users) return res.status(404).send("No user found.");
   	// 	var userdata = [];
   	// 	var cntry = [];
   	// 	Object.keys(users).forEach(async (key) => {
   	// 		if (users[key].country) {
   	// 			var id = userdata.length + 1;
   	// 			if (!cntry.includes(users[key].country)) {
   	// 				cntry.push(users[key].country);
   	// 				var cntryinfo = await module.exports.sanGetCountry(users[key].country);
   	// 				var latlng = await module.exports.getAddressInfo(users[key].country);
   	// 				var found = userdata.some(function (el) {
   	// 					return el.name === users[key].country;
   	// 				});
   	// 				var img =  module.exports.sanRemoveExt(cntryinfo.image);
   	// 				userdata.push({ image: path+img, name: users[key].country, lat_lng: {lattitude:latlng[0].latitude,longitude:latlng[0].longitude} });
   	// 			}  
   	// 		}
   	// 	});
   	// 	setTimeout(function(){ callback(userdata); }, 1000);

   	// }).sort( { _id: -1 } );
    var venue_cities = [];
    Event.find({}, function (err, events) {
        if (err) return res.status(500).send("There was a problem finding the events.");
        if (!events) return res.status(404).send("No events found.");
        Object.keys(events).forEach(function(key) {
            if (events[key].venue_id) {
                venue_cities.push(events[key].venue_id);     
            }
        });
        var country_check = [];
        var country_checkk = [];
        Venue.find( { _id: { $in : venue_cities }}, function(err, venues){
            if (err) return res.status(500).send("There was a problem updating the event.");
            Object.keys(venues).forEach(function(key) {
                if (!country_checkk.includes(venues[key].country)) {
                    country_check.push({'country':venues[key].country,'flag':path+venues[key].country_code+'.png'});
                    country_checkk.push(venues[key].country);
                }
            });
            callback(country_check);
        });
    }).sort( { _id: -1 } );
   },

   sanGetCountry : function(name){ 
   	return new Promise(function (resolve, reject) {
   		Country.findOne({name: name}).exec().then(function(country){ 
   			if(country) {
   				resolve(country);	
   			}
   		});
   	});
   },

   sanAllBusinessUsers : function(req, res, callback) {
   	User.find({}, function (err, user) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!user) return res.status(404).send("No user found.");
   		Event.find({}, function (err, events) {
   			Model.find({}, function (err, models) {
   				if (err) return res.status(500).send("There was a problem finding the users.");
   				var perPage = 4;
   				var page = req.query.page || 1
   				Venue.find({})
   				.sort( { _id: -1 } )
   				.exec(function(err, venues) {
   					Venue.count().exec(function(err, count) {
   						if (err) return next(err)
   							var userdata = { 
   								user: user,
   								events: events,
   								models: models,
   								venues: venues,
   								current: page,
   								pages: Math.ceil(count / perPage)
   							};
   							callback(userdata);
   						})
   				});

	     //    		Venue.find({}, function (err, venues) {
				  //       if (err) return res.status(500).send("There was a problem finding the events.");
				  //       if (!venues) return res.status(404).send("No Venue found.");
				  //       var userdata = { 
						//     user: user,
						//     events: events,
						//     models: models,
						//     venues: venues
						// };
						// callback(userdata);
				  //   }).sort( { _id: -1 } );
				}).sort( { _id: -1 } );

   		}).sort( { _id: -1 } ); 
   	}).sort( { _id: -1 } );
   },

   sanGetEvents : function(req, res, buisness_id, callback) {
   	Event.find({business_id:buisness_id}, function (err, events) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!events) return res.status(404).send("No events found.");

   		Object.keys(events).forEach(function(key) {
   			if (events[key].image && events[key].type !='offer') {
   				events[key].image = module.exports.sanRemoveExt(events[key].image);
   			}
   		});

   		callback(events);
   	}).sort( { _id: -1 } );
   },

   sanGetEvent : function(req, res, venue_id, callback) {
   	Event.find({venue_id:venue_id}, function (err, events) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!events) return res.status(404).send("No events found.");
   		Object.keys(events).forEach(function(key) {
   			if (events[key].image && events[key].type !='offer') {
   				events[key].image = module.exports.sanRemoveExt(events[key].image);
   			}
   		});
   		callback(events);
   	}).sort( { _id: -1 } );
   },

   sanGetEventById : function(req, res, _id, callback) {
   	Event.findById(_id).sort( { _id: -1 } ).populate('venue_id').exec(function(err, events){
    		  // var venues = events.venue_id[0];
    		  if (!events) { callback('no events'); }else{
    		  	var sannnn = 0
    		  	var bangar = 0
    		  	if (events.booking_model_ids) {
    		  		for(var id of events.booking_model_ids.split(',')) {
    		  			if (bangar >= 3) {
    		  				break;
    		  			}
    		  			if (req.query.model_id == id) {
    		  				if (events.type == 'event') {
    		  					sannnn = 1;
    		  				}
    		  				bangar++;
    		  			}              
    		  		}
    		  	}
    		  	var status = '';
    		  	if (bangar == 3) {
    		  		status = 'blocked';
    		  	}else if(events.type == 'offer'){
    		  		status = 'unblocked';
    		  	}
    		  	if (sannnn) {
    		  		status = 'already booked';	
    		  	}
    		  	Object.keys(events).forEach(function(key) {
    		  		if (events[key] && events[key].image && events[key].type !='offer') {
    		  			events[key].image = module.exports.sanRemoveExt(events[key].image);
    		  		}
    		  		if (events[key] && events[key].activity_type && events[key].type =='offer') {
                try {
                    events[key].activity_type = JSON.parse(events[key].activity_type);
                } catch (e) {
                    console.log('not json');
                }
    		  		}
    		  	});
    		  	if (events.booking_model_ids) {
    		  		Model.find( { _id: { $in : events.booking_model_ids.split(',') }}, function(err, models){
    		  			if (err) return res.status(500).send({result:'err'});
    		  			Object.keys(models).forEach(function(key) {
    		  				models[key].last_name = models[key].last_name.charAt(0);
    		  			});
    		  			var userdata = {
    		  				events: events,
    		  				models: models,
    		  				status: status
    		  			}
    		  			callback(userdata);
    		  		});
    		  	}else{
    		  		var userdata = {
    		  			events: events,
    		  			status: status
    		  		}
    		  		callback(userdata);
    		  	}

    		  }

	      //      events.forEach(function(user) {
			    //     user.friends.forEach(function(friend) {
			    //         adTimes.push(friend.adTime);
			    //     });
			    // });
	          //console.log(events.venue_id);
	      });
   },

   sanGetAllEvents : function(req, res, callback) {
   	Event.find().sort( { _id: -1 } ).populate('venue_id').exec(function(err, events){
      if (events) {
        Object.keys(events).forEach(function(key) {
        if (events[key].start_date) {
          var today = new Date();
          var newdate = events[key].start_date.setHours(0,0,0,0);

                var crntdate = today.getTime();
          var hours = module.exports.sanGetDurations(events[key].created_date,today);
                if (events[key].available_hrs) {
                    var set_day = events[key].available_hrs;  
                }else{
                    var set_day = 24;
                }
                if (hours > set_day) {
                  events[key].status = 'AVAILABLE';
                }else{
                  // events[key].status = 'NOT AVAILABLE';
                } 
                events[key].save();
              }
              if (events[key].image && events[key].type !='offer') {
              events[key].image = module.exports.sanRemoveExt(events[key].image);
            }
        });
        callback(events);
      }
   	});
   },
   /* Refresh Models to Check Suspensions */
   sanCheckSuspensionPeriods : function(){
   		Model.find({}, function (err, models) {
   			var today = new Date();
   			Object.keys(models).forEach(function(key) {
   				if (models[key].suspend_duration) {
   					var sus_date = models[key].suspend_date;
   					var days = module.exports.sanGetDurations(sus_date,today,'d');
   					console.log(days);
   					if (days > models[key].suspend_duration) {
   						models[key].status = 1;
   						models[key].block = 0;
   						models[key].save();
   					} 
   				}
   			});
   		});
   },

   sanGetAllCountries : function(req, res, callback) {
   	var path = 'http://'+req.headers.host+'/files/country/';
   	Country.find({delete:0}, function (err, cntries) { console.log(cntries);
   		Object.keys(cntries).forEach(function(key) {
   			cntries[key].image = path+module.exports.sanRemoveExt(cntries[key].image);
   		});
   		callback(cntries);
   	});
   },

   sanUpdateCountries : function(country){

   },

   sanGetAllPosts : function(req, res,model_id, callback) {
   	var Post = require('./controllers/Post');
   	Post.find({model_id:model_id}, function (err, posts) {
   		if (err) { return res.status(500).send({result:'error'}); }
   		if (!posts) {
   			return res.status(200).send({result:'not found'});
   		}else{
   			callback(posts);
   		}
   	});
   },

   sanGetVenues : function(req, res, buisness_id, callback) {
   	Venue.find({buisness_id:buisness_id}, function (err, venues) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!venues) return res.status(404).send("No Venue found.");
   		callback(venues);
   	}).sort( { _id: -1 } );
   },

   sanGetVenueById : function(req, res, id, callback) {
   	Venue.find({_id:id}, function (err, venues) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!venues) return res.status(404).send("No Venue found.");
   		callback(venues);
   	}).sort( { _id: -1 } );
   },

   sanGetAllVenues : function(req, res, callback) {
   	Venue.find({}, function (err, venues) {
   		if (err) return res.status(500).send("There was a problem finding the events.");
   		if (!venues) return res.status(404).send("No Venue found.");
			// Object.keys(venues).forEach(function(key) {
		 //            if (venues[key].lat && venues[key].lng) {
		 //            }
		 //        });
		 callback(venues);
		}).sort( { _id: -1 } );



	 //    Venue.find({}).then(function(venues) {
		//   var jobQueries = [];
		//   venues.forEach(function(venue) {
		//     jobQueries.push(Event.find({venue_id:venue._id}));
		//   });
		//   return Promise.all(jobQueries );
		// }).then(function(events) {
		// 	console.log(events);
		// }).catch(function(error) {
		//   callback(error);
		// });
	},

	sanGetNearestEvents : function(req, res, country_name, callback) {
		var countryReverseGeocoding = require("country-reverse-geocoding").country_reverse_geocoding();	
    module.exports.sanGetAllEvents(req, res, function(events) {
      var realdata = [];
			var chkduplicates = [];
			Object.keys(events).forEach(function(key) {
				if (events[key].venue_id) {
					var current_loc = {lat: req.body.lat, lon: req.body.lng};    
					var dest = {lat: events[key].venue_id.lat, lon: events[key].venue_id.lng};
					var distance = geodist(current_loc, dest, {exact: true, unit: 'km'});
					events[key].distance = Math.round(distance);
					events[key].lat = events[key].venue_id.lat;
					events[key].lng = events[key].venue_id.lng;
					if (!events[key].description) {
						events[key].description = '';
					}
           if((country_name && !chkduplicates.includes(events[key]._id) || req.body.category ) || req.body.city){
            if (events[key].lat && events[key].lng && events[key].lat !=null && events[key].lng !=null) { 
              // var country = countryReverseGeocoding.get_country(parseFloat(events[key].lat), parseFloat(events[key].lng));  
              var country = events[key].venue_id.country;  
              if (country_name) {
                var final_name = country_name.charAt(0).toUpperCase() + country_name.slice(1);
              }else{
                var final_name = '';
              }
              // console.log('Event City:-'+events[key].venue_id.city);
              // console.log('Selected City:-'+req.body.city);
              if (country && final_name && req.body.category && !req.body.city) { 
                if (country == final_name && events[key].category == req.body.category ) {
                  realdata.push(events[key]);
                  chkduplicates.push(events[key]._id);
                }
              }else if (!country && !final_name && req.body.category && !req.body.city) { console.log('category');
                if (events[key].category == req.body.category ) {
                  realdata.push(events[key]);
                  chkduplicates.push(events[key]._id);
                }
              }else if (country && final_name && !req.body.category && !req.body.city) { 
                if (country == final_name) {
                  realdata.push(events[key]);
                  chkduplicates.push(events[key]._id);
                }
              }else if (req.body.city && !req.body.category) { 
                if (events[key].venue_id.city == req.body.city) {
                  realdata.push(events[key]);
                  chkduplicates.push(events[key]._id);
                }
              }else if (req.body.city && req.body.category) { 
                if (events[key].venue_id.city == req.body.city && events[key].category == req.body.category) {
                  realdata.push(events[key]);
                  chkduplicates.push(events[key]._id);
                }
              }
            }
          }
				}
			});
			var values = realdata.sort(function (a, b) {
				return (a.distance < b.distance) ? -1 : 1;
			});
			callback(values);
		});
	},

	blockmodel : function(req, res, callback){
		var set = {block: 1,status:0};
		if (req.body.suspend_duration) {
			set.suspend_duration = req.body.suspend_duration;
			set.suspend_date = new Date();
			set.approved_date = null;
		}
		Model.updateOne({ _id: req.body.model_id }, { $set: set }, function(err, res) {
			if (err) throw err;
			callback(res);
		});
	},

	sanSendMail : function(req, res, mailOptions) {
		var nodemailer = require('nodemailer');
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'sandeep.digittrix@gmail.com',
				pass: 'dqubzvltrejhcelg'
			}
		});
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				var http = require('http');
				var querystring = require("querystring");
				var qs = querystring.stringify(mailOptions);
				var qslength = qs.length;
				var options = {
					host : 'work4brands.com',
					port : 80,
					path : '/sanmail.php',
					method : 'POST',
					headers:{
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': qslength
					}
				};
				var buffer = "";
				var req = http.request(options, function(res) {
					res.on('data', function (chunk) {
						buffer+=chunk;
					});
					res.on('end', function() {
						console.log(buffer);
					});
				});

				req.write(qs);
				req.end();

			} else {
				console.log('Email sent: ' + info.response);
			}
		});
	},

	sanGetEventModels : function(req, res, id, callback){
		Reserve.findOne({event_id: id}).exec()
		.then(function(reserve){ 
			var result = [];
			return Model.findOne({_id: reserve.model_id}).exec()
			.then(function(models){
				return [reserve, models];
			});
		})
		.then(function(result){
			var reserve = result[0];
			return Event.find({_id: reserve.event_id}).exec()
			.then(function(events) { console.log(events);
				if (events.image) {
					events.image = module.exports.sanRemoveExt(events.image);
				}
				result.push(events);
				return result;
			})
		})
		.then(function(result){
			var reserve = result[0];
			var models = result[1];
			var events = result[2];
			var data = {
				event : events,
				reservation : reserve,
				models : models
			}
			callback(data);
		})
		.then(undefined, function(err){
			callback("err");
		})
	},

	sanGetEventDetail : function(req, res, id, callback){
		Reserve.findOne({_id: id}).exec()
		.then(function(reserve){ 
			var result = [];
			return Event.findOne({_id: reserve.event_id}).exec()
			.then(function(events){ 
        if (events.type=='offer') {
          var activity_detail = module.exports.sanGetEventActivityy(events.activity_type,reserve.reserve_activity);
          return [reserve, events,activity_detail];
        }else{
          return [reserve, events];
        }
			});
		})
		.then(function(result){
			var events = result[1];
			return Venue.find({_id: events.venue_id}).exec()
			.then(function(venue) { 
				if (venue.image) {
					venue.image = module.exports.sanRemoveExt(venue.image);
				}
				result.push(venue);
				return result;
			})
		})
		.then(function(result){
			var reserve = result[0];
			var events = result[1];
      if (result[1].type =='offer') {
        var venues = result[3][0];
        var data = {
          event : events,
          venue : venues,
          reservation : reserve,
          activity_detail : result[2]
        }
      }else{
        var venues = result[2][0];
        var data = {
          event : events,
          venue : venues,
          reservation : reserve,
          activity_detail : ''
        }
      }
			callback(data);
		})
		.then(undefined, function(err){
			callback("err");
		})
	},

	sanRemoveExt : function(sandeep){
    var exts = ['jpeg','jpg','png','gif','svg'];
    for (var i = 0; i < exts.length; i++) {
      if (~sandeep.indexOf(exts[i])){
        sandeep = sandeep.replace(exts[i], "");
      }
    }
    if (sandeep.substring(sandeep.length-1) == ".")
    {
      sandeep = sandeep.substring(0, sandeep.length-1);
    }
    return sandeep;
  },
  sanGetDurations : function(start,end,type='h'){
	   var start_date = moment(start, 'YYYY-MM-DD HH:mm:ss');
       var end_date = moment(end, 'YYYY-MM-DD HH:mm:ss');
       if (type == 'h') {
        var res = moment.duration(end_date.diff(start_date)).asHours();
       }
       if (type == 'd') {
        var res = moment.duration(end_date.diff(start_date)).asDays();
       }
       if (type == 'w') {
        var res = moment.duration(end_date.diff(start_date)).asWeeks();
       }
       if (type == 'm') {
        var res = moment.duration(end_date.diff(start_date)).asMonths();
       }
       if (type == 'y') {
        var res = moment.duration(end_date.diff(start_date)).asYears();
       }
		   return res;
	},

	sanIsSameWeek : function(cdate,start=''){
	   if (start) {
	   	var now = moment(start);
	   }else{
	   	var now = moment();
	   }
	   if (cdate) {
	   	   var lastVote = moment(cdate);
		   if (now.isSame(lastVote, 'week')){
		      return true;
		   } else {
		   	  return false;
		   }
	   }else{
	   	return false;
	   }
	},

	sanGetEventBookings : function(req, res, id, callback){
		Reserve.findOne({event_id: id}).exec()
		.then(function(reserve){ 
			var result = [];
			return Model.findOne({_id: reserve.model_id}).exec()
			.then(function(models){
				return models;
			});
		})
		.then(function(result){
			callback(result);
		})
		.then(undefined, function(err){
			callback("err");
		})
	},

	sanGetReservations : function(id,eventid='') {
    if (id) {
      var set = {model_id: id};
    }
    if (eventid) {
      var set = {event_id: eventid};
    }
		return new Promise(function (resolve, reject) {
			Reserve.find(set, function (error, reserve) {
				if (error) {
					reject(error);
					return;
				}
				resolve(reserve);
			});
		});
		
	},

  sanGetNoOffers : function(venueid) {
    return new Promise(function (resolve, reject) {
      Event.find({type:'offer'}).exec(function(err, events) {
        if (err) {
          reject(err);
          return;
        }
        var offer_counts=0;
        var reserver_counts=0;
        var chkins_counts=0;
        var cancel_cnt=0;
        Object.keys(events).forEach(async(key)=> {
          if (events && events[key].venue_id.equals(venueid)) {
            offer_counts++;
            if (events[key].reservation_count > 0) {
              reserver_counts += events[key].reservation_count;
            }
            if (events[key].checkins_count > 0) {
              chkins_counts += events[key].checkins_count;
            }
            var resreve = await module.exports.sanGetReservations('',events[key]._id);
            cancel_cnt=0;
            Object.keys(resreve).forEach(function(keyy) {
              if (resreve[keyy].status =='cancelled') {
                cancel_cnt++;
              }
            });
          }
        });
        setTimeout(function(){ resolve({'ofr_cnt':offer_counts,'rsr_cnt':reserver_counts,'chkin_cnt':chkins_counts,'cancel_cnt':cancel_cnt}); }, 1000);
        
      });
    });
  },

  sanGetEventsByVenue : function(venueid) {
    return new Promise(function (resolve, reject) {
      Event.find({}).exec(function(err, events) {
        if (err) {
          reject(err);
          return;
        }
        var fin_events = [];
        Object.keys(events).forEach(function(key) {
          if (events[key].venue_id.equals(venueid)) {
            fin_events.push(events[key]);
          }
        });
        resolve(fin_events);
        //setTimeout(function(){ resolve({'ofr_cnt':offer_counts,'rsr_cnt':reserver_counts,'chkin_cnt':chkins_counts,'cancel_cnt':cancel_cnt}); }, 1000);
        
      });
    });
  },

  sanGetVenue : function(req, res, buisness_id) {
    return new Promise(function (resolve, reject) {
      Venue.find({buisness_id:buisness_id}, function (err, venues) {
        // if (err) return res.status(500).send("There was a problem finding the events.");
        // if (!venues) return res.status(404).send("No Venue found.");
        resolve(venues);
      });
    });
   },

	sanCheckModel : function(id) {
		return new Promise(function (resolve, reject) {
			Model.findOne({_id: id}, function (error, model) {
				if (error) {
					reject(error);
					return;
				}
				resolve(model);
			});
		});
	},

	findVisitsWithPlace : function(model_id, offer) {
		return new Promise(function (resolve, reject) {
			Model.find({
				_id: model_id
			}, function (error, models) {
				if (error) {
					reject(error);
					return;
				}

	            // build a result object you want.
	            // ()
	            resolve({
	            	models: models
	            });
	        });
		});
	},

	sanGetEventActivity : function(req, res, callback){
		var query = Event.findOne({ '_id': req.query.event_id });
		var actarra = {};
		query.exec(function (err, events) {
			if (err) return handleError(err);
			var sannnn = 0;
			var bangar = 0;
			if (events.booking_model_ids) {
				for(var id of events.booking_model_ids.split(',')) {
					if (bangar >= 3) {
						break;
					}
					if (req.query.model_id == id) {
						if (events.type == 'event') {
							sannnn = 1;
						}
						bangar++;
						console.log(bangar);
					}              
				}
			}
			var status = '';
			if (bangar == 3) {
				status = 'blocked';
			}else if(events.type == 'offer'){
				status = 'unblocked';
			}
			if (sannnn) {
				status = 'already booked';	
			}
			actarra['start_date'] = events.start_date;
			actarra['image'] = events.image;
			actarra['name'] = events.name;
			actarra['status'] = events.status;
			actarra['res_status'] = status;
			var activity = JSON.parse(events.activity_type);
			Object.keys(activity).forEach(function(key) {
				if (key == req.query.activity) {
					actarra[key] = activity[key];
				}         
			});
			callback(actarra);
		});
	},

  sanGetEventActivityy : function(activities,activity){ 
          var actarra = {};
          var activities = JSON.parse(activities);
          Object.keys(activities).forEach(function(key) {
            if (key == activity) {
              actarra[key] = activities[key];
            }         
          });
          return actarra;
  },

	getEvent : function (event_id) {
		return new Promise(function (resolve, reject) {
			Event.findOne({_id: event_id}, function (error, event) {
				if (error) {
					reject(error);
					return;
				}
				resolve(event);
			});
		});
	},
	/* Get Address Info */
	getAddressInfo : function (addr) {
		return new Promise(function (resolve, reject) {
			geocoder.geocode(addr)
			  .then(function(res) {
			    resolve(res);
			  })
			  .catch(function(err) {
			    reject(err);
			  });
		});
	},

  sanRemoveDuplicates : function(originalArray, prop){
     var newArray = [];
     var lookupObject  = {};

     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }

     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
  },

	sanGetModelById : function(req,res,next,id){
		Model.where({_id: id}).findAsync().then(function(model) {
			return model;
		}).catch(next).error(console.error);
	},

  san_middleware : function(req, res,next){
      var token = req.session.token;
      if (!token && req.path != '/admin/login' && !req.path.includes("assets")){
        return res.redirect('login');
      }
      next();
  },

	sanKey : function(req, res, next) {
		res.json("78d88993fd997052c0e58415a838b30e2a459b21");
	}
}