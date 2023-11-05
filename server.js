const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server);

const users = {}

const questions = [
    { question: "What is 2+2", answer: "4" },
    // ...other questions
];
let currentQuestion = null;
let questionAnswered = false;

app.use(express.static(__dirname)); 

io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = { name: name, points: 0 };
        if (!currentQuestion) {
            currentQuestion = questions[Math.floor(Math.random() * questions.length)];
            questionAnswered = false;
            io.emit('room-question', currentQuestion.question); // Send to all users
        } else {
            socket.emit('room-question', currentQuestion.question); // Send only to the new user
        }
        socket.broadcast.emit('user-connected', name);

    });

    socket.on('send-chat-message', message => {
        if (message.toLowerCase() === currentQuestion.answer.toLowerCase() && !questionAnswered) {

            questionAnswered = true;
            users[socket.id].points += 1; // Increment points for the user who answered correctly
            io.emit('correct-answer', { name: users[socket.id].name, points: users[socket.id].points }); // Announce the correct answer
            // Optionally, set a timeout to send a new question after some time
        } 
            socket.broadcast.emit('chat-message', { message: message, name: users[socket.id].name });
            });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
    });
});


server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
});
