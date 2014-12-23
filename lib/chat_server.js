/* Socket IO chat server */

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

/* Now we have to define the 'listen' method of the Socket.IO server */

exports.listen = function(server) {
    io = socketio.listen(server);
    
    io.set('log level', 1);
    
    io.sockets.on('connection', function (socket) {
        guestNumber = assignGuestNumber(socket, guestNumber, nickNames, namesUsed);
        console.log(guestNumber);
        
        joinRoom(socket, 'Lobby');
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);
        
        socket.on('rooms', function() {
        
            socket.emit('rooms', io.sockets.manager.rooms);
        });
        
        handleClientDisconnection(socket, nickNames, namesUsed);
    
    });
};

/* Assigning new users */
function assignGuestNumber(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest'+guestNumber;
    nickNames[socket.id] = name;
    
    socket.emit('nameResult', {success:true, name:name});
    
    namesUsed.push(name);
    return guestNumber+1;
}

/* Join a room */

function joinRoom(socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room: room});
    
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined the ' + room + '.'
    });
    
    var usersInRoom = io.sockets.clients(room);
    
    if(usersInRoom.length > 1) {
        var usersInRoomSummary = 'Current users in room :' +room + ' : ';
        
        for(var index in usersInRoom) {
        var userSocketId = usersInRoom[index].id;
        
        if(userSocketId != socket.id) {
            if(index > 0) usersInRoomSummary += ', ';
            usersInRoomSummary += nickNames[userSocketId];
        }          
            
        }
        usersInRoomSummary += '.';
        socket.emit('message', {text: usersInRoomSummary});
    
    } 
    
    
    
    
    
}

/* Change a name */

function handleNameChangeAttempts(socket, nickNames, namesUsed) {
    socket.on('nameAttempt', function(name) {
        if(name.indexOf('Guest')==0) {
            socket.emit('nameResult', {success:false, message:'Names cannot begin with a "Guest"'});
        } else {
            if (namesUsed.indexOf(name) == -1) {
                var previousName = nickNames[socket.id];
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                delete namesUsed[previousNameIndex];
                
                socket.emit('nameResults', {success:true,name:name});
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {text: previousName + ' is now known as ' + name +'.'});
                
            } else {
                socket.emit('nameResult', {success:false, message: 'That name is already in use'});
            }
        }
    
    });

}


/* Send chat messages */

function handleMessageBroadcasting(socket) {
    socket.on('message', function(message) {
    
        socket.broadcast.to(message.room).emit('message', {text:nickNames[socket.id] + ': '+message.text});
    });   
}

/* Creating rooms */

function handleRoomJoining(socket) {
    socket.on('join', function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    
    });
    
}

/* Handle disconnections */

function handleClientDisconnection(socket) {
    socket.on('disconnect', function(){
         var nameIndex = namesUsed.indexOf(nickNames[socket.id]);    
         delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });   
}
