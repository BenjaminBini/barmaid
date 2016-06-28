'use strict';

const extend = require('extend');
const http = require('http');
var nodeStatic = require('node-static');

class Server {
  constructor(options) {
    if (!options.path && !options.port) {
      throw new Error('You have to chose a directory and a port');
    }
    if (!options.path) {
      throw new Error('You have to chose a directory');
    }
    if (!options.port) {
      throw new Error('You have to chose a port'); 
    }

    let defaultOptions = {
      isActive: false,
      //autoIndex: true,
      //download: false
    }

    extend(defaultOptions, options);

    this.path = defaultOptions.path;
    this.port = defaultOptions.port;
    this.isActive = defaultOptions.isActive;
    //this.autoIndex = defaultOptions.autoIndex;
    //this.download = defaultOptions.download;


    // Maintain a hash of all connected sockets, to be able to stop the server
    this._sockets = {};
    this._nextSocketId = 0;

    this._createServer();

    if (this.isActive) {
      this.start();
    }
  }

  start() {
    this.isActive = true;
    this.staticServer.listen(this.port);
  }

  stop() {
    this.isActive = false;
    this._killServer();
  }

  _createServer() {
    const fileServer = new nodeStatic.Server(this.path);

    this.staticServer = http.createServer((req, res) => {
      req.addListener('end', () => {
        fileServer.serve(req, res);
      }).resume();
    });

    this.staticServer.on('connection', (socket) => {
      // Add a newly connected socket
      var socketId = this._nextSocketId++;
      this._sockets[socketId] = socket;

      // Remove the socket when it closes
      socket.on('close', () => {
        delete this._sockets[socketId];
      });

    });
  }

  /**
   * Close the server and destroy all the open sockets
   */
  _killServer() {
    // Destroy all open sockets
    for (var socketId in this._sockets) {
      this._sockets[socketId].destroy();
    }
    // Close the server
    this.staticServer.close();
  };
}

module.exports = Server;

