const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server);

const users = {}

const questions = [
    { question: "What is 2+2?", answer: "4" },
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
    { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
    { question: "What element does 'O' represent on the periodic table?", answer: "Oxygen" },
    { question: "What year did the Titanic sink in the Atlantic Ocean?", answer: "1912" },
    { question: "In what country would you find the Great Pyramid of Giza?", answer: "Egypt" },
    { question: "What is the name of the longest river in the world?", answer: "Amazon" },
    { question: "What is the freezing point of water in degrees Celsius?", answer: "0" },
    { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
    { question: "What is the hardest natural substance on Earth?", answer: "Diamond" },
    { question: "How many continents are there on Earth?", answer: "7" },
    { question: "What is the smallest prime number?", answer: "2" },
    { question: "What is the main ingredient in guacamole?", answer: "Avocado" },
    { question: "Which planet is known as the Red Planet?", answer: "Mars" },
    { question: "In computing, what does 'CPU' stand for?", answer: "Central Processing Unit" },
    { question: "What is the currency of Japan?", answer: "Yen" },
    { question: "Who is known as the father of Geometry?", answer: "Euclid" },
    { question: "What is the chemical formula for table salt?", answer: "NaCl" },
    { question: "What novel features the characters Elizabeth Bennet and Mr. Darcy?", answer: "Pride and Prejudice" }
];

let currentQuestion = null;
let questionAnswered = false;

app.use(express.static(__dirname)); 

io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = { name: name, points: 0 };

        // Send the current question to the new user
        if (!currentQuestion || questionAnswered) {
            generateNewQuestion();
        }
        socket.emit('room-question', currentQuestion.question); // Send only to the new user
        socket.broadcast.emit('user-connected', name);

        // Emit the updated leaderboard to the new user
        emitLeaderboard(socket);
    });

    socket.on('send-chat-message', message => {
        // Check if the message is the correct answer and the question hasn't been answered yet
        if (currentQuestion && message.toLowerCase() === currentQuestion.answer.toLowerCase() && !questionAnswered) {
            questionAnswered = true;
            users[socket.id].points += 1; // Increment points for the user who answered correctly
            updateLeaderboard();
            // Announce the correct answer to all users
            io.emit('correct-answer', {
                name: users[socket.id].name,
                points: users[socket.id].points
            });

            // Update the leaderboard for all users
            updateLeaderboard();

            clearQuestion();
            // Wait 5 seconds before generating a new question
            setTimeout(generateNewQuestion, 600);
        } 
            socket.broadcast.emit('chat-message', { message: message, name: users[socket.id].name });
        
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id].name);
        delete users[socket.id];
        updateLeaderboard(); // Update the leaderboard when a user disconnects
    });
});


server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
});


function emitLeaderboard(socket) {
    const leaderboard = Object.values(users).sort((a, b) => b.points - a.points);
    socket.emit('leaderboard-update', leaderboard); // Emit to specific socket (new user)
}

function updateLeaderboard() {
    const leaderboard = Object.values(users).sort((a, b) => b.points - a.points);
    io.emit('leaderboard-update', leaderboard); // Emit to all users
}

function generateNewQuestion() {
    if (questions.length === 0) {
        io.emit('no-more-questions', 'No more questions available.');
        return;
    }
    let questionIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[questionIndex];

    questionAnswered = false;

    io.emit('room-question', currentQuestion.question);

    questions.splice(questionIndex, 1);
}

function clearQuestion() {
    io.emit('room-question', '');
}


