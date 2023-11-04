const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname)); // Serve static files from the current directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Send your HTML file as a response
});

io.on('connection', socket => {
    console.log('new User');
    socket.emit('chat-message', 'Hello World');
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
});
