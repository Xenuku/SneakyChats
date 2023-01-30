const serverBot = "SneakyBOT";
const moment = require('moment');
const {
    userJoin,
    getCurrentUser,
    getRoomUsers,
    chatMessage,
    userLeave,
    changeRoom,
    getRoomHistory,
    getChannels
} = require('./chat.js');
module.exports = (io, client) => {
    // On connection, get the channels, add to room, send messages to all users in the room and the user that just joined
    io.on('connection', socket => {
        let time = moment().format('h:mm a');
        socket.on('join', (username, room) => {
            const user = userJoin(socket.id, username, room);
            const getGroupList = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(getChannels(username));
                }, 1000);
            });
            getGroupList.then(result => { 
                socket.emit('groupList', {groupList: result});
            });
            socket.join(room);
            // Announce to all that the user joined
            socket.broadcast.to(user.room).emit('message', chatMessage(serverBot, `${user.username} has joined ${user.room.replace('_', ": ")}`, time));
            // Welcome user
            socket.emit('message', chatMessage(serverBot, "Welcome to the room", time));
            io.to(user.room).emit('usersInRoom', {room: user.room, users: getRoomUsers(user.room)});
        });
        // On message, format it using chat.js functions and send to client. If the user enters !test10
        // Send 10 messages of their message back (for testing only)
        socket.on('message', (username, message) => {
            let time = moment().format('h:mm a');
            const user = getCurrentUser(socket.id);
            const group = user.room.split('_')[0];
            const room = user.room.split('_')[1];
            client.db("history").collection(group).insertOne({room: room, username: username, text: message, time: time});
            if(message === '!test10'){ 
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));
                io.to(user.room).emit('message', chatMessage(username, message, time));    
            }
            io.to(user.room).emit('message', chatMessage(username, message, time));
        });
        // If the 'message' is an image, store it in the database and send it to all clients
        socket.on('chat-image', (username, image) => {
            let time = moment().format('h:mm a');
            const user = getCurrentUser(socket.id);
            const group = user.room.split('_')[0];
            const room = user.room.split('_')[1];
            client.db("history").collection(group).insertOne({room: room, username: username, image: image, time: time});
            io.to(user.room).emit('chat-image', {username: username, image: image, time: time});
        })
        // When the user changes rooms, get the history and send it to the client. 
        // Broad cast room changes 
        socket.on('changeRoom', (data) => {
            let time = moment().format('h:mm a');
            // Grab the history of the room, 10 messages
            const historyFetch = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(getRoomHistory(data.newRoom));
                }, 300);
            });
            const user = getCurrentUser(socket.id);
            socket.leave(data.oldRoom);
            changeRoom(socket.id, data.newRoom);
            io.to(data.oldRoom).emit('message', chatMessage(serverBot, `${user.username} has left the room`, time));
            io.to(data.oldRoom).emit('usersInRoom', {room: data.oldRoom, users: getRoomUsers(data.oldRoom)});
            
            // Join the new room
            socket.join(user.room);
            // Broadcast to the room that the user joined
            socket.broadcast.to(user.room).emit('message', chatMessage(serverBot, `${user.username} has joined ${user.room.replace('_', ": ")}`, time));
            // Get the rooms history and let the user know what room they are now chatting in 
            historyFetch.then(
                result => { socket.emit('roomHistory', {history: result});}
                ).then(
                    () => socket.emit('message', chatMessage(serverBot, `You are now chatting in ${user.room.replace('_', ": ")}`, time))
                );
            // Broadcast the users to the room
            io.to(user.room).emit('usersInRoom', {room: user.room, users: getRoomUsers(user.room)});
        });

        // On disconnect, remove the user and emit messages to client for other users
        socket.on('disconnect', () => {
            let time = moment().format('h:mm a');
            const user = userLeave(socket.id);
            if(user) {
                io.to(user.room).emit('message', chatMessage(serverBot, `${user.username} has left the server`, time));
                io.to(user.room).emit('usersInRoom', {room: user.room, users: getRoomUsers(user.room)});
            }
        });
    })
}