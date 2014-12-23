function divEscapedContentElement(message) {
    return $('<div></div>').text(message);
}

function divEscapedSystemContentElement(message) {
    return $('<div></div>').html('<i>'+message+'</i>');
}

function processUserInput(chatApp, socket) {

    var message = $('#field').val();
    var systemMessage;
    
    if(message.charAt(0) == '/') {
        systemMessage = chatApp.processCommand(message);
        if(systemMessage) {
            $('#messages').append(divEscapedSystemContentElement(systemMessage));
        
        }
    } else {
    
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    
    $('#field').val('');

}


var socket = io.connect();

$(document).ready(function() {

    var chatApp = new Chat(socket);

    socket.on('nameResult', function(result) {
    
        var message;
        if(result.success) {
            message = 'You are now known as :' +result.name +'.';
            
        } else {
            message = result.message;    
        }
        
        $('#messages').append(divEscapedSystemContentElement(message));
    
    });
        
    socket.on('joinResult', function(result) {    
        $('#room').text(result.room);
        $('#messages').append(divEscapedSystemContentElement('Room changed!'));
    
    });
    
    
    socket.on('message', function(message) {
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    
    });
    
    socket.on('rooms', function(rooms) {
        $('#room-list').empty(); /* .empty() deletes the HTML text */
         
        for(var room in rooms) {
            room = room.substring(1, room.length);
            if ( room != '') {
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        
        $('#room-list div').click(function() {
        
            chatApp.processCommand('/join' + $(this).text());
            $('#field').focus();
        
        });
        
        setInterval(function() {
            socket.emit('rooms');
        }, 1000);
    
    });
    

    $('#messageForm').submit(function() {

        //var message = $('#field').val();

        //chatApp.sendMessage($('#room').text(), message);

        //$('#messages').html(message);
        
        processUserInput(chatApp, socket);
        return false;  
    });

});

