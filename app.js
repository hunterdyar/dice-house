var createError = require('http-errors');
var express = require('express');
var secure = require('express-force-https');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomRouter = require('./routes/room');

var app = express();
app.use(secure);//force https
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 12103;

//Library Setup
app.use('/static',express.static('node_modules)'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',roomRouter);
// app.use('/users', usersRouter);
// app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//Whenever someone connects this gets executed
io.on('connection', function(socket){
  let q = socket.handshake.query;
  let roomName = q.room;
  if(roomName == "") {
    roomName = newRandomLobbyName();
  }
  socket.join(roomName);
  //Send this event to everyone in the room.
  io.sockets.in(roomName).emit('connectToRoom', roomName);

  io.of("/").adapter.on("delete-room", (room) => {
    //todo: manage disconnects and discard things better.
    // console.log(`room ${room} deleted`);
  });
  // //Whenever someone disconnects this piece of code executed
  // socket.on('disconnect', function () {
  //   console.log('A user disconnected');
  // });

  socket.on("joinRoom",function(data){
    //todo: check if client is already in room.
    socket.rooms;
    //todo: check if room is new?

    //todo: check for null.
    data = data.toString();
    if(data) {
      console.log("user leaving "+socket.rooms);
      let oldRooms = Array.from(socket.rooms);//This doesn't feel right. Todo: somebody fix this.
      for(let i = 1;i<oldRooms.length;i++)
      {
        let r = oldRooms[i];
        socket.leave(r);
      }
      socket.join(data);
      console.log("user joining "+data);
      // socket.emit("connectToRoom", data);//todo: why isn't this updating?
      io.sockets.in(data).emit('connectToRoom', data);

    }
  });
  socket.on("roll",function(data)
  {
    socket.in(data.room).emit("otherRoll",data);
  });
  socket.on("updateForm",function(entryData)
  {
    socket.in(entryData.room).emit("otherForm",entryData);
  });
});

http.listen(PORT, function(){
  console.log('listening on *:'+PORT);
});

//Lobby Name Things.
function newRandomLobbyName()
{
  let n = randomLobbyName();

  if(io.sockets.in(n).size > 0)
  {
    return newRandomLobbyName();
  }

  // const arr = getActiveRooms(io);
  //
  // if(arr.includes(n)){
  //     return newRandomLobbyName();
  // }
  return n;

}

let nameOnes = ['banana' +
'pancake','billy','dungeon','dragon','sword','jail','arrow','happy','quest','volcano','knife','ring','item','journey','destiny','marathon','blizzard','storm','squire','blacksmith','dagger','dreams']
let nameTwos = ['adventure','hundred','great','simple','orange','green','red','yellow','blue','purple','chase','axe','magic','wizard','ninja','tornado','light']

function randomLobbyName()
{
  return nameOnes[Math.floor(Math.random()*nameOnes.length)]+"-"+Math.floor(Math.random()*10)+"-"+nameTwos[Math.floor(Math.random()*nameTwos.length)]+"-"+Math.floor(Math.random()*10);
}

function getActiveRooms(io) {
  // Convert map into 2D list:
  // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
  const arr = Array.from(io.sockets.adapter.rooms);
  // Filter rooms whose name exist in set:
  // ==> [['room1', Set(2)], ['room2', Set(2)]]
  const filtered = arr.filter(room => !room[1].has(room[0]))
  // Return only the room name:
  // ==> ['room1', 'room2']
  const res = filtered.map(i => i[0]);
  return res;
}