'use strict';

const Server = require('./server');

class ServersManager {
  constructor() {
    this.servers = [];
  }

  addServer(options) {
    if (!options.path && !options.port) {
      throw new Error('You have to chose a directory and a port');
    }
    if (!options.path) {
      throw new Error('You have to chose a directory');
    }
    if (!options.port) {
      throw new Error('You have to chose a port'); 
    }

    if (this.servers.filter(s => s.params.port === options.port).length > 0) {
      throw new Error('This port is already in use.');
    }
    // Path and port are mandatory
    if (!options.path && !options.port) {
      throw new Error('You have to chose a directory and a port');
    }
    if (!options.path) {
      throw new Error('You have to chose a directory');
    }
    if (!options.port) {
      throw new Error('You have to chose a port'); 
    }
    try {
      let server = new Server(options);
      this.servers.push(server);
    } catch(e) {
      console.log(e);
      throw new Error('This port is already in use.');
    }
  }

  removeServer(server, callback) {
    server.stop();
    const indexToRemove = this.servers.indexOf(server);
    if (indexToRemove > -1) {
      this.servers.splice(indexToRemove, 1);
    }
  }

  editServer(options, callback) {
    let serverWrapped = this.servers.filter(s => s.id === options.id);
    if (serverWrapped.length !== 1) {
      throw new Error('This server does not exist');
    }
    let server = serverWrapped[0];
    server.stop(() => {
      const indexToRemove = this.servers.indexOf(server);
      if (indexToRemove > -1) {
        this.servers.splice(indexToRemove, 1);
      }
      this.addServer(options);
      if (callback) {
        callback();
      }
    });
  }
}

module.exports = ServersManager;
