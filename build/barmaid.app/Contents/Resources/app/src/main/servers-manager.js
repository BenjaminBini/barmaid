'use strict';

const Server = require('./server');

class ServersManager {
  constructor() {
    this.servers = [];
  }

  addServer(options) {
    if (this.servers.filter(s => s.port === options.port).length > 0) {
      throw new Error('This port is already in use.');
    }
    try {
      let server = new Server(options);
      this.servers.push(server);
    } catch(_) {
      throw new Error('This port is already in use.');
    }
  }

  removeServer(server) {
    server.stop();
    const indexToRemove = this.servers.indexOf(server);
    if (indexToRemove > -1) {
      this.servers.splice(indexToRemove, 1);
    }
  }
}


module.exports = ServersManager;
