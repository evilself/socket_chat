/* Author: BorisM on 12.17.2014 */
/* This is the MAIN Chat server  - server-side JS on NODE */

/* Here are my dependencies to some Node modules */

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

/* empty cache */
var cache = {};

/* Here are some JS functions to deal with different responses */

/* 404 NOT FOUND */

function send404(response) {
    response.writeHead('404', {'Content-Type':'text/plain'});
    response.write('Oops...The requested resource could not be found! (404)');
    response.end();
}

/* Now, we have to deal with the static content, or serving stating content */

function sendFile(response, filePath, fileContents) {    
    response.writeHead('200', {"Content-Type": mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

/* It's better to cache our static files in memory, as opposed to reading from filesystems */

function serveStatic(response, cache, absPath) {    
    if(cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {       
        fs.exists(absPath, function(exists) {                
            if(exists) {                     
                fs.readFile(absPath, function(err, data){
                    if(err){
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
        
    }
}

/* Here lies the code for our HTTP server */

var server = http.createServer(function(request, response) {
    var filePath = false;
    
    if(request.url == '/') {        
        filePath = 'public/index.html';
    } else {        
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
}).listen(3000);
console.log('Chat server is listening on port 3000');

/* Socket.IO dependency server */
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
 