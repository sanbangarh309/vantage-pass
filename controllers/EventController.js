var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectID;

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Event = require('./Event');
var Venue = require('./Venue');
var Category = require('./Category');
var Reserve = require('./Reserve');
var sanban = require('../functions');
var config = require('../config');
/* For Image */
var multer  = require('multer');
var upload = multer({ dest: './uploads/events/' });
var uploads = multer({ dest: './uploads/venues/' });
var uploadss = multer({ dest: './uploads/qrcodes/' });
var sanUpload = upload.fields([{ name: 'event_image', maxCount: 1 }]);
var sanUpload2 = upload.fields([{ name: 'offer_image', maxCount: 1 }]);
var sanUpload3 = uploads.fields([{ name: 'venue_image', maxCount: 1 }]);
var qrcode_image = uploadss.fields([{ name: 'qrcode_image', maxCount: 1 }]);
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder(config.options);
var Promise = require('bluebird');
/* Start Cron Job */
var cron = require('node-cron');
cron.schedule('* * * * *', function(req,res,next){
    var reload_models = sanban.sanCheckSuspensionPeriods;
    sanban.sanGetAllEvents(req,res, function(events){
         reload_models();
         console.log('Refreshing Events..');
    });
});
/****End Cron Job ****/
// Event.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 
// Venue.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 

/*************/

// CREATES A NEW EVENT
router.post('/add_event',sanUpload, function (req, res) {
    var path = 'http://'+req.headers.host+'/files/events/';
    if (req.files && req.files.event_image != undefined) {
          var parts = req.files.event_image[0].mimetype.split("/"),
          ext = parts[1];
          var imgfilename = req.files.event_image[0].filename+'.'+ext;
    }
    if (imgfilename ==undefined) {
      var newpath = '';
    }else{
        var newpath = path+imgfilename;
    }
    Event.create({
        business_id : req.body.business_id, 
        name : req.body.venue_name,
        venue_id : req.body.venue_id ? req.body.venue_id : [],
        start_date : new Date(req.body.start_date),
        end_date : new Date(req.body.end_date),
        dress_code : req.body.dress_code,
        details : req.body.details ? req.body.details : '',
        type : 'event',
        image : newpath,
        distance : 0,
        lat : 0,
        lng : 0,
        reservation_count : 0,
        reservation_id: 0,
        checkins_count:0,
        category: req.body.category,
        created_date:new Date(),
        status : 'AVAILABLE SOON'
    }, 
    function (err, event) {
       if (err) return res.status(500).send({ status: false,detail: error});
       if (req.body.add_from_admin) {
            return res.redirect('/admin/events?add=1');
       }else{
            res.status(200).send(event);
       }
    });
});

// CREATES A NEW OFFER
router.post('/add_offer',sanUpload2, function (req, res) {
	
//var php = require('run-php');

// set PHP Binary file
// php.binaryFile = '/usr/bin/php';
// var str = php.eval('echo "a"').ob_get_content();
// console.log(str);
// res.status(200).send(str);

 //    var path = 'https://'+req.headers.host+'/vantage/uploads/events/';
 //    if (req.files.offer_image != undefined) {
 //      var parts = req.files.offer_image[0].mimetype.split("/"),
 //        ext = parts[1];
 //      var imgfilename = req.files.offer_image[0].filename+'.'+ext;
 //    }
 //    if (imgfilename ==undefined) {
 //        var newpath = '';
 //    }else{
 //        var newpath = path+imgfilename;
 //    }



 //    for (var name in req.body.activity_type) {
	//    if (req.body.activity_type[name].length > 0) {
	//    	console.log(req.body.activity_type[name]);
	//    		for (var i = 0; i < req.body.activity_type[name].length; i++) {
	// 		   	console.log(req.body.activity_type[name][i].offer_value);
	// 		}
	//    }
	// }
 //    // console.log(req.body['breakfast']['details']);
 //    res.status(200).send(req.body.activity_type);
    // var final = '';
    // if (req.body.lunch_offer_value !='' && req.body.breakfast_offer_value =='' && req.body.dinner_offer_value =='') {
    //      var final = { lunch: {offer_value: req.body.lunch_offer_value,dress_code: req.body.lunch_dress_code,details: req.body.lunch_details,time: req.body.lunch_time}};
    // }else if (req.body.lunch_offer_value =='' && req.body.breakfast_offer_value !='' && req.body.dinner_offer_value =='') {
    //     var final = { breakfast: {offer_value: req.body.breakfast_offer_value,dress_code: req.body.breakfast_dress_code,details: req.body.breakfast_details,time: req.body.lunch_time}};
    // }else if(req.body.lunch_offer_value =='' && req.body.breakfast_offer_value =='' && req.body.dinner_offer_value !=''){
    //     var final = { dinner: {offer_value: req.body.dinner_offer_value,dress_code: req.body.dinner_dress_code,details: req.body.dinner_details,time: req.body.lunch_time}};
    // }else if (req.body.lunch_offer_value !='' && req.body.breakfast_offer_value !='' && req.body.dinner_offer_value =='') {
    //     var final = { lunch: {offer_value: req.body.lunch_offer_value,dress_code: req.body.lunch_dress_code,details: req.body.lunch_details,time: req.body.lunch_time},breakfast: {offer_value: req.body.breakfast_offer_value,dress_code: req.body.breakfast_dress_code,details: req.body.breakfast_details,time: req.body.lunch_time}};
    // }else if (req.body.lunch_offer_value !='' && req.body.dinner_offer_value !='' && req.body.breakfast_offer_value =='') {
    //     var final = { lunch: {offer_value: req.body.lunch_offer_value,dress_code: req.body.lunch_dress_code,details: req.body.lunch_details,time: req.body.lunch_time},dinner: {offer_value: req.body.dinner_offer_value,dress_code: req.body.dinner_dress_code,details: req.body.dinner_details,time: req.body.dinner_time}};
    // }else if (req.body.lunch_offer_value =='' && req.body.dinner_offer_value !='' && req.body.breakfast_offer_value !='') {
    //     var final = { breakfast: {offer_value: req.body.breakfast_offer_value,dress_code: req.body.breakfast_dress_code,details: req.body.breakfast_details,time: req.body.breakfast_time},dinner: {offer_value: req.body.dinner_offer_value,dress_code: req.body.dinner_dress_code,details: req.body.dinner_details,time: req.body.dinner_time}};
    // }else{
    //     var final = { lunch: {offer_value: req.body.lunch_offer_value,dress_code: req.body.lunch_dress_code,details: req.body.lunch_details,time: req.body.lunch_time},breakfast: {offer_value: req.body.breakfast_offer_value,dress_code: req.body.breakfast_dress_code,details: req.body.breakfast_details,time: req.body.breakfast_time},dinner: {offer_value: req.body.dinner_offer_value,dress_code: req.body.dinner_dress_code,details: req.body.dinner_details,time: req.body.dinner_time}}
    // }
    //console.log(final);
    /* Save Method */
    // var events = new Event(final);
    // events.business_id = req.body.business_id;
    // events.name = req.body.name;
    // events.venue_id = req.body.venue_id;
    // events.start_date = new Date(req.body.start_date);
    // events.type = 'offer';
    // events.image = newpath;
    // events.distance = 0;
    // events.lat = 0;
    // events.lng = 0;
    // events.reservation_count = 0;
    // events.reservation_id = 0;
    // events.checkins_count = 0;
    // events.time = req.body.time;
    // events.status = 'AVAILABLE SOON';
    // //res.status(200).send(events);
    // events.save(function(err) {
    //   if (err) return res.status(500).send({ status: false,detail: 'error'});
    //   res.status(200).send(events);
    // });
    /***************/
});
// Venue.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 
// CREATES A NEW VENUE
router.post('/add_venue',sanUpload3, function (req, res) {
    var path = 'http://'+req.headers.host+'/files/venues/';
    if (req.files.venue_image != undefined) {
          var parts = req.files.venue_image[0].mimetype.split("/"),
          ext = parts[1];
          var imgfilename = req.files.venue_image[0].filename;
    }
    if (imgfilename ==undefined) {
        var newpath = '';
    }else{
        var newpath = path+imgfilename;
    }
    geocoder.geocode(req.body.location, function(err, response) {
        // const ct = require('countries-and-timezones');
        var cityTimezones = require('city-timezones');
        var country = req.body.country;
        // console.log(response[0].countryCode.toLowerCase());
        
        sanban.sanUpdateCountries(country);
        var city = req.body.city;
        if (response[0].formattedAddress) {
            var lat = response[0].latitude;
            var lng = response[0].longitude;
            if (!country) {
                country = response[0].country;
                city = response[0].city;
            }
            var code = response[0].countryCode;
            var timezones = cityTimezones.lookupViaCity(response[0].city);
            // var timezones = ct.getTimezonesForCountry(code);
            var address = response[0].formattedAddress;
        }else{
            var lat = req.body.lat;
            var lng = req.body.lng;
            var address = '';
            var code = '';
            var timezones = '';
        }
       // res.json(timezones);
        Venue.create({
            buisness_id : req.body.business_id, 
            venue_name : req.body.venue_name,
            address : address,
            lat : lat,
            lng : lng,
            country : country,
            country_code : code.toLowerCase(),
            timezones : timezones,
            city : city,
            location : req.body.location,
            venue_image : newpath,
            description : req.body.description,
            phone : req.body.phone,
            website : req.body.website
        }, 
        function (err, venues) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            if (req.body.add_from_admin) {
                return res.redirect('/admin/home?add=1');
            }else{
                res.status(200).send(venues);
            }
        });
    });
});
/* Get Cities */
router.get('/get_cities', function (req, res) {
    var country = req.query.country;
    var venue_cities = [];
    Event.find({}, function (err, events) {
        if (err) return res.status(500).send("There was a problem finding the events.");
        if (!events) return res.status(404).send("No events found.");
        Object.keys(events).forEach(function(key) {
            if (events[key].venue_id) {
                venue_cities.push(events[key].venue_id);     
            }
        });
        Venue.find( { _id: { $in : venue_cities },country:country}, function(err, venues){
            if (err) return res.status(500).send("There was a problem updating the event.");
            res.status(200).send(venues);
        });
    }).sort( { _id: -1 } );
});
/* Categories */
router.get('/get_categories', function (req, res) {
    Category.find().sort( { _id: -1 } ).exec(function(err, categories) {
        res.status(200).send(categories);
    });
});

// RETURNS ALL THE EVENTS IN THE DATABASE
router.get('/', function (req, res) {
    var userid = req.query.business_id;
    Event.find({}).sort( { _id: -1 } ).populate('venue_id').exec(function(err, events){
        if (err) return res.status(500).send("There was a problem finding the events.");
        if (!events) return res.status(404).send("No events found.");
        var ttlevents = [];
        Object.keys(events).forEach(function(key) {
            if (events[key].business_id.equals(userid)) {
                  if (events[key].image && events[key].type !='offer') {
                      events[key].image = sanban.sanRemoveExt(events[key].image);
                  }
                  if (events[key].business_id == userid) {
                    ttlevents.push(events[key]);
                  }else{
                    ttlevents.push(events[key]);
                  }
            }
            
    });
        res.status(200).send(ttlevents);
    });
    // sanban.sanGetEvents(req, res, userid, function(events) {
    //     res.status(200).send(events);
    // });
});

router.get('/get_by_san', function(req, res){
    var myCursor = Event.find();
    console.log(myCursor);
    // myCursor.forEach(function(race) {
    //     printjson(race.name);
    //     console.log(race.name);    
    // });
    //var myDocument = myCursor.hasNext() ? myCursor.next() : null;
    // if (myDocument) {
    //     var myName = myDocument.name;
    //     printjson(myName);
    // }
})

// RETURNS ALL THE EVENTS IN THE DATABASE
router.get('/get_all', function (req, res) {
    sanban.sanGetAllEvents(req, res, function(events) {
        res.status(200).send(events);
    });
});

// UPDATES A SINGLE EVENT IN THE DATABASE
router.put('/update/:id', function (req, res) {
    //req.body.created_date = new Date('2018-07-10T05:00:00.000Z');
    Event.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, event) {
        if (err) return res.status(500).send("There was a problem updating the event.");
        res.status(200).send(event);
    });
}); 

router.put('/update_venue/:id', function (req, res) {
    Venue.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, event) {
        if (err) return res.status(500).send("There was a problem updating the event.");
        res.status(200).send(event);
    });
});



// DELETES A EVENT FROM THE DATABASE
router.delete('/:id', function (req, res) {
    Event.findByIdAndRemove(req.params.id, function (err, events) {
        if (err) return res.status(500).send("There was a problem deleting the Event.");
        res.status(200).send("Event: "+ events.name +" was deleted.");
    });
});
// Venue.remove({business_id: '5aa11fc0b4b31a684e413b7c'});
// DELETES A EVENT FROM THE DATABASE
router.delete('/delete_ven/:id', function (req, res) {
    Venue.remove({ business_id: req.params.id }, function(err) {
        if (!err) {
            Event.remove({business_id: req.params.id});
            res.status(200).send("deleted.");
        }
        else {
            message.type = 'error';
            res.status(200).send("err.");
        }
    });

});

//Delete all
router.get('/delete_all', function (req, res) {
    Event.remove({});
    res.status(200).send("Removed");
});

router.get('/venues', function (req, res) {
    var userid = req.query.business_id;
    sanban.sanGetVenues(req, res, userid, function(venues) {
        res.status(200).send(venues);
    });
});

router.get('/detail', function (req, res) {
    var event_id = req.query.event_id;
    sanban.sanGetEventById(req, res, event_id, function(events) {
        res.status(200).send(events);
    });
});

router.get('/activity_detail', function (req, res) {
    sanban.sanGetEventActivity(req, res, function(data) {
        res.status(200).send(data);
    });
});

router.post('/current_loc_event', function (req, res) {
    var country_name = req.body.country_name;
    sanban.sanGetNearestEvents(req, res, country_name, function(locations) {
        if (locations.length >0 ) {
            res.status(200).send(locations);
        }else{
            res.status(200).send({'msg':'No Event Exist In This Country!'});
        }
    });
});

router.get('/venue', function (req, res) {
    var id = req.query.venue_id;
    sanban.sanGetEvent(req, res, id, function(events) {
        res.status(200).send(events);
    });
});
// Reserve.remove({}, function(err) { 
//    console.log('collection removed') 
// }); 
/* Reservation */
router.get('/ger_qr', function(req, res){
    sanban.sanGenerateQRCode(req, res,'5ab4a937eb94a416bf612344', function(data){
        res.status(200).send(data);
    })
})
// Reserve.remove({_id:'5b7cf0aeba1a016d4916bbcb'}, function(err) { 
//    console.log('collection removed') 
// });
router.post('/add_reserve',qrcode_image, async (req, res)=> {
    var khanatype = [];
    var model_data = await sanban.sanCheckModel(req.body.model_id);
    if (model_data.block == 1 || model_data.status == 0) {
            res.status(200).send({'msg':'Model is blocked Or Not Approved!'});
    }else{
     Event.findById(req.body.event_id).sort( { _id: -1 } ).populate('venue_id').exec(function(err, events){
        Reserve.find({event_id:events._id}, function (err, reservations) {
            if (err) return res.status(500).send("There was a problem finding the reservation.");
            var today = new Date();
            today.setHours(0,0,0,0);
            var dates = [];
            var chk = parseInt(3)-parseInt(events.checkins_count);
            // console.log(reservations.length);console.log(chk);
            var bangar = 0;
            var sannnn = 0;
            if (events.booking_model_ids) {
                for(var id of events.booking_model_ids.split(',')) {
                    if (bangar >= 3) {
                        break;
                    }
                    if (req.body.model_id == id) {
                        if (events.type == 'event') {
                            sannnn = 1;
                        }
                        bangar++;
                    }              
                }
            }
            if (bangar == 3 || sannnn == 1) {
                if (bangar == 3) {
                    sanban.blockmodel(req, res, function(models){
                        res.status(200).send({result : 'you are blocked!. Can use Maximum 3 offers per day'});
                    })
                }else if (sannnn == 1) {
                    res.status(200).send({result : 'Event already Booked!'});
                }
            }else{
                var day_limit = 0;
                var week_limit = 0;
                var reserv_ids = [];
                var reserv_id = '';
                var cancel = 0;
                var stop = 0;
                Object.keys(reservations).forEach(function(key) {
                    reservations[key].created_date.setHours(0,0,0,0);
                    if (reservations[key].created_date.getTime() == today.getTime()) {
                        day_limit++;
                    }
                    if (day_limit == 1 && req.body.model_id == reservations[key].model_id) {
                        stop=1;
                        return false;
                    }
                    week_limit++;
                    dates.push(reservations[key].created_date.getTime());
                    if (events.type == 'event' && reservations[key].event_id == req.body.event_id && reservations[key].model_id == req.body.model_id && reservations[key].status =='cancelled') {
                    	cancel = 1;
                    	reserv_id = reservations[key]._id;
                    }
                });
                var subahbhoj = 0;
                var dopahrbhoj = 0;
                var ratribhoj = 0;
                var activity = [];
                if (events.type == 'offer' && stop !=1) {
                    try {
                        var chkact = JSON.parse(events.activity_type);
                    } catch (e) {
                        var chkact = events.activity_type;
                    }
                    if (typeof reservations !== 'undefined' && reservations.length > 0) {
                       for (type in chkact) {
                            if (chkact[type].offer_value !=0 && (reservations.lunch == 0 && dates.indexOf(today.getTime()) != '-1') || (chkact[type] && reservations.lunch != 0 && dates.indexOf(today.getTime()) == '-1')) {
                                khanatype.push(type);
                            }
                        }
                    }else{
                        dates.push(today.getTime());
                            for (type in chkact) {
                                if (chkact[type] && chkact[type].offer_value !=0 && dates.indexOf(today.getTime()) != '-1') {
                                        khanatype.push(type);
                                }
                            }

                    }
                    
                        if (khanatype.indexOf(req.body.food_type) != '-1') {
                            activity.push(req.body.food_type);
                        }
                }
             //process.exit();
             var newpath = '';
             if (events.status =='AVAILABLE' && stop !=1) {
                if ((day_limit < events.day_limit && dates.indexOf(today.getTime()) != '-1') && events.type =='offer' && activity.length > 0) {
                    var path = 'http://'+req.headers.host+'/files/qrcodes/';
                        Reserve.create({
                            model_id : req.body.model_id, 
                            event_id : events._id,
                            qrcode_image : newpath,
                            reserve_activity : activity.join(','),
                            status : 'init'
                        }, 
                        function (err, reservation) {
                                if (err) return res.status(500).send({result:'error'});
                                var idsss = '';
                                if (events.booking_model_ids) {
                                    var idsss =  events.booking_model_ids+','+reservation.model_id;
                                }else{
                                    var idsss = reservation.model_id
                                }
                                Event.findByIdAndUpdate(reservation.event_id, { $inc: { reservation_count: 1 },$set: { "booking_model_ids": idsss}}, function(err, events){
                                    sanban.sanGetEventById(req,res,events._id, function(events){
                                        sanban.sanGenerateQRCode(req,res,reservation._id, function(image){
                                            events.reservation_id = reservation._id;
                                            events.qrcode = image;
                                            Reserve.findByIdAndUpdate(reservation._id, { $set: { "qrcode_image": image}}, function(err, events){});
                                            res.status(200).send(events);
                                        });
                                    });
                                })
                            });
                }else if (week_limit < events.week_limit && dates.indexOf(today.getTime()) == '-1' && events.type =='offer' && activity.length > 0) {
                        Reserve.create({
                            model_id : req.body.model_id, 
                            event_id : events._id,
                            qrcode_image : newpath,
                            reserve_activity : activity.join(','),
                            status : 'init'
                        }, 
                        function (err, reservation) {
                            console.log(err);
                            if (err) return res.status(500).send({result:'error'});

                            if (events.model_ids) {
                                var idsss = events.model_ids+','+reservation.model_id;
                            }else{
                                var idsss = reservation.model_id;
                            }
                            Event.findByIdAndUpdate(reservation.event_id, { $inc: { reservation_count: 1 },$set: { "booking_model_ids": idsss}}, function(err, events){
                                sanban.sanGetEventById(req,res,events._id, function(events){
                                    sanban.sanGenerateQRCode(req,res,reservation._id, function(image){
                                        events.reservation_id = reservation._id;
                                        events.qrcode = image;
                                        Reserve.findByIdAndUpdate(reservation._id, { $set: { "qrcode_image": image}}, function(err, events){});
                                        res.status(200).send(events);
                                    });
                                });
                            })

                        });
                }else if(events.type =='offer' && activity.length > 0){
                    res.status(200).send({result:'day or week limit exceeded!'});
                }else{
                	if (cancel ==1) {
                		Reserve.findByIdAndUpdate(reserv_id, { $set: { "status": 'init'}}, function(err, reservation){
                            if (events.booking_model_ids) {
                                var idsss = events.booking_model_ids+','+reservation.model_id;
                            }else{
                                var idsss = reservation.model_id;
                            }
                            Event.findByIdAndUpdate(reservation.event_id, { $inc: { reservation_count: 1 },$set: { "booking_model_ids": idsss}}, function(err, events){
                                sanban.sanGetEventById(req,res,events._id, function(events){
                                   sanban.sanGenerateQRCode(req,res,reservation._id, function(image){
                                    events.reservation_id = reservation._id;
                                    events.qrcode = image;
                                    Reserve.findByIdAndUpdate(reservation._id, { $set: { "qrcode_image": image}}, function(err, events){});
                                    res.status(200).send(events);
                                });
                               });
                            })
                        })
                	}else{
                		Reserve.create({
                            model_id : req.body.model_id, 
                            event_id : events._id,
                            status : 'init'
                        }, 
                        function (err, reservation) {
                            if (err) return res.status(500).send({result:'error'});

                            if (events.booking_model_ids) {
                                var idsss = events.booking_model_ids+','+reservation.model_id;
                            }else{
                                var idsss = reservation.model_id;
                            }
                            Event.findByIdAndUpdate(reservation.event_id, { $inc: { reservation_count: 1 },$set: { "booking_model_ids": idsss}}, function(err, events){
                                sanban.sanGetEventById(req,res,events._id, function(events){
                                        sanban.sanGenerateQRCode(req,res,reservation._id, function(image){
                                            events.reservation_id = reservation._id;
                                            events.qrcode = image;
                                            Reserve.findByIdAndUpdate(reservation._id, { $set: { "qrcode_image": image}}, function(err, events){

                                            });
                                            res.status(200).send(events);
                                        });
                                    });
                            }) 
                        });
                	}
                }
            }else{
                res.status(200).send({result:'event not available or venue booked already!'});
            }
        }
    }).sort( { _id: -1 } );
});
}
});

router.get('/cancel_rserve', function(req,res){
 Reserve.findById(req.query.reservation_id, async (err, reserve)=> {
     if(err) {
         res.status(500).send({result:'error'});
     } else {
        var ids_arr = [];
        var model_data = await sanban.sanCheckModel(reserve.model_id);
        if (model_data.block == 1 || model_data.status == 0) {
            res.status(200).send({'msg':'Model is blocked Or Not Approved!'});
        }else{
            if (reserve && reserve.status != 'cancelled') {
                Event.findById(reserve.event_id, async (err, event)=> {
                    var today = new Date();
                    var hours = sanban.sanGetDurations(event.created_date,today);
                    console.log(event.cncl_hrs);
                    if (event.cncl_hrs > 0 && hours < event.cncl_hrs) {
                        res.status(200).send({'msg':'You can not cancel reservation till '+event.cncl_hrs+' Hours of offer beginning.'});
                    }else if (!event.cncl_hrs && hours < 6) {
                        res.status(200).send({'msg':'You can not cancel reservation till 6 Hours of offer beginning.'});
                    }else{
                        if (event.booking_model_ids.indexOf(",") >= 0) {
                            ids_arr = event.booking_model_ids.split(',');
                        }else{
                            ids_arr.push(event.booking_model_ids);
                        }
                        var i = ids_arr.indexOf(reserve.model_id);
                        for (var i = 0; i < ids_arr.length; i++) {
                            if (reserve.model_id == ids_arr[i] ) {
                                ids_arr.splice(i, 1);
                                break;
                            }
                        }
                        if (!ids_arr) {
                            event.booking_model_ids = '';   
                            event.reservation_count = 0; 
                        }else{
                            event.booking_model_ids = ids_arr.join(',');
                            event.reservation_count = event.reservation_count-1;
                        }
                        var all_reser = await sanban.sanGetReservations(reserve.model_id);
                        var chk = 0;
                        var teen = 0
                        var cancel_dates = [];
                        all_reser.forEach(function(values){
                            if (values.cancelled_date) {
                                    cancel_dates.push(values.cancelled_date);
                                    var chkk = sanban.sanIsSameWeek(values.cancelled_date);
                                    if (chkk) {
                                        chk++;
                                    } 
                            }
                        });
                        if (cancel_dates.length > 2) {
                            for (var i = 0; i < cancel_dates.length; i++) {
                                var pahle_wale = sanban.sanIsSameWeek(cancel_dates[i+1],cancel_dates[i]);
                                if (pahle_wale) {
                                    teen++;
                                }
                            }
                        }
                        // console.log(teen);
                        // console.log(chk);
                        // (teen && chk < 2) || (!teen && chk < 3) || (!teen && cancel_dates.length > 2)
                         // if (chk < 4) {
                            reserve.cancelled_by = reserve.model_id;
                            reserve.cancelled_date = today;
                            reserve.status = 'cancelled';
                            reserve.save();
                            event.save();
                            if (!teen && chk < 3) {
                                var userdata = {
                                    event : event,
                                    reserve : reserve,
                                    warning : 'Your account will be suspended for seven (7) days on next time cancellation of three times in a week.',
                                    msg : 'Your account will be suspended for seven (7) days on next time cancellation of three times in a week.'
                                }
                                res.status(200).send(userdata);
                            }else if(teen && chk >= 3){
                                req.body.model_id = reserve.model_id;
                                req.body.suspend_duration = 7;
                                sanban.blockmodel(req, res, function(models){
                                    res.status(200).send({'msg' : 'you are blocked!. Your Account (suspended) for seven (7) days and cannot reserve any more offers until account is unsuspended'});
                                });
                            }else if((teen && chk < 2) || (!teen && cancel_dates.length > 2)){
                                var userdata = {
                                    event : event,
                                    reserve : reserve,
                                    warning : 'you only have 1 more cancellation this week before being suspended. Are you sure you want to cancel. yes or no?',
                                    msg : 'you only have 1 more cancellation this week before being suspended. Are you sure you want to cancel. yes or no?'
                                }
                                res.status(200).send(userdata);
                            }else{
                                res.status(200).send({'msg':'You Have Already Cancelled Two Offer/Event in this Week!'});
                            }
                        // }else{
                        //     res.status(200).send({'msg':'You Are Blocked!'});
                        // }
                    }
                } );
            }else{
                res.status(200).send({'msg':'Reservation Not Exist Or Already Cancelled!'});
            }
        }
    }
});
});

router.get('/get_reservations', function (req, res, next) {
    var model_id = req.query.model_id;
    if (model_id) {
        Reserve.find({model_id:model_id},function (err, reservations){
         if (err) { res.status(500).send({result:'err'}); }
            var final_events = [];
            Object.keys(reservations).forEach( async (key) => {
                if (reservations[key].event_id) {
                   var eventt = await sanban.getEvent(reservations[key].event_id);
                   if (eventt && eventt.booking_model_ids) {
                        var bookingsids = eventt.booking_model_ids.split(',');
                        if (bookingsids.includes(model_id)) {
                            eventt.reserve_status = reservations[key].status;
                            eventt.reservation_id = reservations[key]._id;
                            final_events.push(eventt);
                        }
                   }
                    if (eventt && eventt.image && eventt.type !='offer') {
                      eventt.image = sanban.sanRemoveExt(eventt.image);
                    }
               }
           });
            setTimeout(function(){ res.status(200).send(final_events); }, 1000);
            });
    }else{
        Reserve.find({},function(err, reservations){
         if(err) {
             res.status(500).send({result:'error'});
         } else {
             res.status(200).send(reservations);
         }
     });
    }
});

router.get('/get_reser_detail', function(req,res){
    sanban.sanGetEventDetail(req,res,req.query.reservation_id, function(details){
        res.status(200).send(details);
    })
});

router.post('/checkin', function(req,res){
    Reserve.findOne({_id: req.body.reservation_id}, function (err, reserve) {
        reserve.status = 'approved';
        Event.findOne({_id: reserve.event_id}, function (err, events) {
            if (events.checkins_model_ids) {
                var checkinidss = events.checkins_model_ids+','+reserve.model_id;
            }else{ 
                var checkinidss = reserve.model_id;
            }
            if (events.booking_model_ids) {
                var bookingsids = events.booking_model_ids.split(',');
                var i = bookingsids.indexOf(reserve.model_id);
                for (var i = 0; i < bookingsids.length; i++) {
                    if (reserve.model_id == bookingsids[i] ) {
                        bookingsids.splice(i, 1);
                        break;
                    }
                }
            } //res.status(200).send(events);
            // { $inc: { checkins_count: 1 },
            Event.findByIdAndUpdate(events._id,{ $inc: { checkins_count: 1,reservation_count: -1 },$set: { "checkins_model_ids": checkinidss,"booking_model_ids": bookingsids.join(',')}}, function(err, events){})
        });
        reserve.save(function (err) {
            if(err) {
                console.error('ERROR!');
            }
            res.status(200).send(reserve);
        });
    });
});
module.exports = router;