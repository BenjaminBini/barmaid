'use strict';

const extend = require('extend');
const http = require('http');
var express = require('express');
var path = require('path');
var uuid = require('node-uuid');

class Server {
  /**
   * Build our server according to the options
   */
  constructor(options) {
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

    this.id = uuid.v1();

    let defaultOptions = {
      isActive: false,
      pug: false
      //autoIndex: true,
      //download: false
    }

    extend(defaultOptions, options);

    this.params = {
      path: defaultOptions.path,
      port: defaultOptions.port,
      pug: defaultOptions.pug
    };

    this.isActive = defaultOptions.isActive;
    //this.autoIndex = defaultOptions.autoIndex;
    //this.download = defaultOptions.download;

    // Create express app
    this._app = express();

    // Configure template engines
    this._app.set('view engine', 'pug');
    this._app.set('views', this.params.path);

    
    // Pug middlware
    if (this.params.pug) {
      // Enable pug template engine for jade extensions too
      this._app.engines = {'.jade': require('pug').__express};
      
      this._app.use(['*.pug', '*.jade'], (req, res, next) => {
        res.render(path.join(this.params.path, req.originalUrl));
      });
    }

    // Set middleware for static files
    this._app.use(express.static(this.params.path));

    // Create the static server
    this._createServer();

    if (this.isActive) {
      this.start();
    }
  }

  /**
   * Start the server
   */
  start() {
    this.isActive = true;
    this._server.listen(this.params.port);
  }

  /**
   * Stop the server
   */
  stop(callback) {
    this.isActive = false;
    this._killServer(callback);
  }

  /**
   * Create the http server and initialize the socket tracking
   */
  _createServer() {
    // Listen to the port and save the http native server
    this._server = this._app.listen(this.params.port)

    // Keep track of sockets to be able to close 
    // all of them when we want to close the server
    this._sockets = {};
    this._nextSocketId = 0;
    this._server.on('connection', (socket) => {
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
  _killServer(callback) {
    // Destroy all open sockets
    for (var socketId in this._sockets) {
      this._sockets[socketId].destroy();
    }
    // Close the server
    this._server.close(callback);
  };
}

module.exports = Server;
