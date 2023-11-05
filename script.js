const chatHeader = document.getElementById('chat-header'); 
const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container'); 
const messageInput = document.getElementById('message-input');

const name = prompt('What is your name?');
appendMessage('You joined');
socket.emit('new-user', name);

socket.on('room-question', question => {
    chatHeader.innerText = question; 
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
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);

    messageContainer.scrollTop = messageContainer.scrollHeight;
}