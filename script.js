const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

// wait until we get a proper name from the user, then join
var name = prompt('What is your name?')
while (name == "null") {
    name = prompt('What is your name?')
    console.log("in here")
}
appendMessage('You joined')
socket.emit('new-user', name)

// check for errors
socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
});

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`) 
})

socket.on('user-connected', name => {
    appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`);
});

messageForm.addEventListener('submit', e => {
    e.preventDefault() // stop page from posting to server
    const message = messageInput.value
    appendMessage(`You: ${message}`) 
    socket.emit('send-chat-message', message)
    messageInput.value = '' 
})

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}