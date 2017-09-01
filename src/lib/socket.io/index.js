import Redis from 'socket.io-redis';
import chalk from 'chalk';
import fs from "fs";
import config from '../../config';

const io = require('socket.io')(config.io.port);
io.adapter(Redis(config.io.redis));

// Scan events
const pathSocket = `${config.base}/api/sockets`;
let events = [];
fs.readdirSync(pathSocket).forEach(path => {
    events.push(`${pathSocket}/${path}`);
});

// Total socket clients
function total() {
    io.of('/').adapter.clients((err, clients) => {
        console.log(chalk.magentaBright(`Socket total clients = ${clients.length}`));
    });
}

// Connect
export async function connect() {

    return await io.on('connection', socket => {

        if (config.log) {
            console.log(chalk.magentaBright(`Socket connected - node = ${config.node}`));
            total();
        }

        // inject events to new socket...
        events.forEach(path => require(path).default(socket, io));

        socket.on('disconnect', () => {
            if (config.log) {
                console.log(chalk.magentaBright(`Socket disconnect - node = ${config.node}`));
                total();
            }
        });

    });
}