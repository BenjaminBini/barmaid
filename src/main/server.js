'use strict';

class Server {
  contructor(path, port, isActive, options) {
    this.path = path;
    this.isActive = isActive;
    this.port = port;
  }

  start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
  }
}

module.exports = Server;