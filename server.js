const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const users = [];

io.on('connection', function(socket) {
  console.log('A user connected');

  socket.on('setUsername', function(data) {
    socket.username = data;
    console.log('username entered as : ', socket.username);
    if (users.indexOf(data) > -1) {
      socket.emit('userExists', data + ' username is taken! Try some other username.');
    } else {
      users.push(data);
      socket.emit('userSet', { username: data });
      socket.broadcast.emit('newmsg', { user: data, message: 'is connected to the conversation' });
    }
  });

  socket.on('msg', function(data) {
    // Send message to everyone
    io.sockets.emit('newmsg', data);
  });

  socket.on('disconnect', function(data) {
    console.log('A user disconnected [username: ', socket.username, ']' );
    const index = users.indexOf(socket.username);
    if (index > -1) {
      const disconnectedUser = users.splice(index, 1)[0];
      io.emit('newmsg', { user: disconnectedUser, message: 'has left the conversation' });
    }
  });

});

http.listen(3000, function() {
  console.log('listening on localhost:3000');
});
