const client = require('./db.js');
const users = [];
// Join the user into their chosen room
function userJoin(id, username, room) {
    const user = {id, username, room};
    users.push(user);
    return user;
}
// Get the current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}
// Get the users in the current room
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}
// Format the chat message for the front-end to process
function chatMessage(username, text, time) {
    return { username, text, time }
}
// Remove the user from the users list when they leave
function userLeave(id) {
    const i = users.findIndex(user => user.id === id);
    if(i !== -1) {
        return users.splice(i, 1)[0];
    }
}
// When the user changes room, update their room in the list

function changeRoom(id, newRoom) {
    const i = users.findIndex(user => user.id === id);
    if(i !== -1) {
        users[i].room = newRoom;
    }
}
// Get the history for the room the user has entered, send to client
async function getRoomHistory(room) {
    const group = room.split('_')[0];
    const channel = room.split('_')[1];
    history = client.db("history").collection(group).find({room: channel}).sort({_id:-1}).limit(10);
    history = await history.toArray();
    history = history.reverse();
    return history;
}
// Get the channels the user has access to for the groups they are a part of, superadmin gets all of them
async function getChannels(username) {
    let user = await client.db("chatserver").collection("users").findOne({username: username});
    if(user.level === 'superadmin') {
        let groups = client.db('chatserver').collection("groups").find({});
        groups = await groups.toArray();
        let channels = [];
        for (const group of groups) {
            channels.push({group: group.group, channels: group.channels});
        }
        return channels;
    } else if(user.groups.length === 0) {
        return [];
    } else {
        let channels = [];
        for(const group of user.groups) {
            let result = await client.db('chatserver').collection("groups").find({group: group.group});
            result = await result.toArray();
            if(group.role === 'Admin' || group.role === "Moderator") {
                channels.push({group: group.group, channels: result[0].channels});
            } else {
                filteredChannels = result[0].channels.filter((channel) => group.channels.includes(channel));
                channels.push({group: group.group, channels: filteredChannels});
            }
        }
        return channels;
    }
}
module.exports = {
    userJoin,
    getCurrentUser,
    getRoomUsers,
    chatMessage,
    userLeave,
    changeRoom,
    getRoomHistory,
    getChannels
}