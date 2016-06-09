'use strict';

const Server = require('./server');

class ServersManager {
  constructor() {
    this.servers = [];
  }

  addServer(path, port, options) {
    let server = new Server(path, port, options);
    this.servers.push(server);
    server.start();
  }

  removeServer(server) {

  }
}


module.exports = ServersManager;
