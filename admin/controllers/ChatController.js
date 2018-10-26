var express = require('express');
var app = express();  
var server = require('http').createServer(app);  
var http = require("http").Server(express)

var io = require('socket.io')(server);
var config = require('../../config');

var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var Chat = require('./Chat');

router.get('/',function(req, res){
   res.sendFile(config.directory + '/views/chat.html');
});

router.post("/save", function(req, res){

    try {

        var chat = new Chat(req.body)

        chat.save();

        res.sendStatus(200)

    } catch (error) {

        res.sendStatus(500)

        console.error(error)

    }

})



router.post("/chats", function (req, res){

 try {

 var chat = new Chat(req.body)

 Chat.save()

 res.sendStatus(200)

 //Emit the event

 io.emit("chat", req.body)

 } catch (error) {

 res.sendStatus(500)

 console.error(error)

 }

})

// io.on("connection", (socket){

//     console.log("Socket is connected...")

// })

router.get("/get_chats", function(req, res){

    Chat.find({}, function(error, chats){

        res.send(chats)

    })

})

io.on('connection', function(client) {
    console.log('Client connected...');


 client.on('save_message', function(data) {
    	// client.join(data);            
      /*create a new room if does not exists, join a room*/
      console.log("created");    
      // getClientsInRoom(data);
        // io.emit(data, 'created');
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

module.exports = router;