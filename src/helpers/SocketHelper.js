// 000 server
var express = require('express');
var socketio = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketio(server);

io.on('connect', function (socket) {
  socket.on('userConnected', socket.join);
  socket.on('userDisconnected', socket.leave);
});

function message (userId, event, data) {
  io.sockets.to(userId).emit(event, data);
}


// 000 client
var socket = io('http://localhost:9000');  // Server endpoint

socket.on('connect', connectUser);

socket.on('message', function (data) {
  console.log(data);
});

function connectUser () {  // Called whenever a user signs in
  var userId = ...  // Retrieve userId
  if (!userId) return;
  socket.emit('userConnected', userId);
}

function disconnectUser () {  // Called whenever a user signs out
  var userId = ...  // Retrieve userId
  if (!userId) return;
  socket.emit('userDisconnected', userId);
}