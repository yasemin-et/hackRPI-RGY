const chatHeader = document.getElementById('chat-header'); 
const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container'); 
const messageInput = document.getElementById('message-input');
const colors = ['#ffbdee', '#bdc9ff', '#fff6bd', '#ceffbd', '#bdf4ff', '#ffbdbd', '#BDB2FF', '#FFC6FF', '#FFFFFC'];
const userColors = {};



// wait until we get a proper name from the user, then join
var name = prompt('What is your name?')
while (name == "null") {
    name = prompt('What is your name?')
    console.log("in here")
}
appendMessage('You joined the chat')
socket.emit('new-user', name)

// check for errors
socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
});

socket.on('correct-answer', data => {
    appendMessage(`${data.name} answered correctly and now has ${data.points} points!`, data.name, 'correct-answer');
});


socket.on('room-question', question => {
    const questionElement = document.getElementById('question');
    if (question === '') {
        questionElement.textContent = ' ';
    } else {
        setTimeout(() => {
            questionElement.textContent = question;
        }, 500);
    }
});




socket.on('no-more-questions', message => {
    const questionElement = document.getElementById('question');
    questionElement.textContent = message;
});


socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`) 

})

socket.on('user-connected', name => {
    appendMessage(`${name} connected to the chat`);
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
});

socket.on('leaderboard-update', leaderboard => {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    // Clear current leaderboard
    leaderboardContainer.innerHTML = '<p>LEADERBOARD:</p>';

    // Add new leaderboard entries
    leaderboard.forEach(user => {
        const entryElement = document.createElement('div');
        entryElement.innerText = `${user.name}: ${user.points}`;
        leaderboardContainer.appendChild(entryElement);
    });
});


messageForm.addEventListener('submit', e => {
    e.preventDefault() // stop page from reloading

    // find and display the message
    const message = messageInput.value
    appendMessage(`You: ${message}`) 
    socket.emit('send-chat-message', message)
    messageInput.value = '' 

    // award points if successfully solved the question
})

function appendMessage(message, sender, className) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;

    // Assign a unique color to the sender if not already assigned
    if (!userColors[sender]) {
        userColors[sender] = colors[Object.keys(userColors).length % colors.length];
    }

    // Set the background color of the message element
    if (className) {
        messageElement.classList.add(className);
    } else {
        messageElement.style.backgroundColor = userColors[sender];
    }

    messageContainer.append(messageElement);
}


socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`, data.name);
});