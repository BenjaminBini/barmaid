'use strict';

const Server = require('./server');

class ServersManager {
  constructor() {
    this.servers = [];
  }

  addServer(options) {
    let server = new Server(options);
    if (this.servers.filter(s => s.port === server.port).length > 0) {
      throw new Error('Ce port est déjà en cours d\'utilisation');
    }
    this.servers.push(server);
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
