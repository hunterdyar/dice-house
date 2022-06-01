var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile('C:\\Users\\Blooper\\JupiterSync\\Projects\\Node\\socket-project\\index.html');
});
//Whenever someone connects this gets executed
io.on('connection', function(socket){
    console.log('A user connected');
    // Send a message after a timeout of 4seconds
    io.on('connection', function(socket){
        var roomName = newRandomLobbyName();
        socket.join(roomName);
        //Send this event to everyone in the room.
        io.sockets.in(roomName).emit('connectToRoom', roomName);
    })
    io.of("/").adapter.on("delete-room", (room) => {
        console.log(`room ${room} deleted`);
    });
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
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
        //pass the roll to everyone else in the room.
        let r = socket.rooms[socket.rooms.size-1];
        //.broadcast is implicit.
        socket.in(data.room).emit("otherRoll",data);
    })
});

http.listen(3000, function(){
    console.log('listening on *:3000');
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
'pancake','billy','dungeon','dragon','sword','jail','arrow','happy','quest','volcano','knife','ring','item']
let nameTwos = ['adventure','hundred','great','simple','orange','green','red','yellow','blue','purple','chase','axe','magic','wizard']

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