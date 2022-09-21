const { Server } = require("socket.io");

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origins: ['http://localhost:4200']
        }
    });
    // const io = require('socket.io')(server, {
    //     cors: {
    //         origins: ['http://localhost:4200']
    //     }
    // });

    io.on('connection', (socket) => {
        console.log('a user connected with id :', socket.id);
        console.log('if user connected :', socket.connected);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('my message', (msg) => {
            console.log('message: ' + msg);
        });

        // socket.on('my message', (msg) => {
        //     io.emit('my broadcast', `server: ${msg}`);
        // });
    });
}