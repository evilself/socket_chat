/* Create one JS object Chat and constructor with one parameter -the socket */
/* NOTE: FOR THIS TO BECOME A JS CLASS ADD METHODS TO ITS PROTOTYPE!!!! */

var Chat = function(socket) {
    this.socket = socket;
};

Chat.prototype.sendMessage = function(room, text) {
    
    console.log('here');
    
    var message = {room:room, text:text};
    
    this.socket.emit('message', message);
};

/* Change rooms */
Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', {newRoom: room});

};

Chat.prototype.processCommand = function(command) {

    var words = command.split(' ');
    var command = words[0].substring(1, words[0].length).toLowerCase();
    
    var message = false;
    
    switch(command) {
    
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unrecognized command';
            break;    
    }
    return message;
};