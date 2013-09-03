var http = require('http');
var fs = require('fs');
var mime = require('mime');
var path = require('path');

var cache = {};

function send404(res){
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.end('Error 404: resource not found');
}

function sendFile(res, filePath, fileContents)
{
    res.writeHead(
        200,
        { "Content-Type": mime.lookup(path.basename(filePath)) }
    );
    res.end(fileContents);
}

function serveStatic(response, cache, absPath)
{
    if(cache[absPath])
    {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
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

var server = http.createServer(function (req, res) {

    var filePath = false;

    if (req.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + req.url;
    }

    var absPath = './' + filePath;

    serveStatic(res, cache, absPath);

});

server.listen(process.env.PORT || 8080, function(){
  console.log("server listening on port " + (process.env.PORT || 8080));  
});

var chatServer = require("./lib/chat_server");
chatServer.listen(server);