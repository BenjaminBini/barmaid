'use strict';

const extend = require('extend');

class Server {
  constructor(options) {
    if (!options.path && !options.port) {
      throw new Error('Le répertoire et le port sont obligatoires');
    }
    if (!options.path) {
      throw new Error('Le répertoire est obligatoire');
    }
    if (!options.port) {
      throw new Error('Le port est obligatoire'); 
    }

    let defaultOptions = {
      isActive: false,
      autoIndex: true,
      download: false
    }

    extend(defaultOptions, options);

    this.path = defaultOptions.path;
    this.port = defaultOptions.port;
    this.isActive = defaultOptions.isActive;
    this.autoIndex = defaultOptions.autoIndex;
    this.download = defaultOptions.download;
  }

  start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
  }
}

module.exports = Server;
