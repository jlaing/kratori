import path from 'path'
import Main from './server/Main.js'

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Configure the socket.io connection settings.
// See http://socket.io/
// TODO , figure out what this is, configure is not a function error
/*
io.configure(function (){
  io.set('log level', 0);
  io.set('authorization', function (handshakeData, callback) {
    callback(null, true); // error first callback style
    console.log("authorization");
  });
  console.log("socket config");
});
*/

http.listen(4000, function () {
  console.log('listening on *:4000')
})

let main = new Main(io)
main.init()
