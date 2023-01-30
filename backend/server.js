const path = require('path');
const { resolve } = require('path');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const client = require('./functions/db.js');
const socketio = require('socket.io');
const io = socketio(server);
client.connect();

require('./functions/socket.js')(io, client);

app.use(express.json({ limit: 9000000}));
app.use(cors({
    origin: '*'
}));
app.use(express.static(path.join(__dirname, '../frontend/dist/assign1')));


require('./routes/auth.js')(app, client);
require('./routes/groups.js')(app, client);
require('./routes/user.js')(app, client);
require('./routes/channels.js')(app, client);

server.listen(3000);

console.log(`Server started on port 3000`);

module.exports = server