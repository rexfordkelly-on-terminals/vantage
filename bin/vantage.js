#!/usr/bin/env node

var commander = require("commander")
  , Vantage = require("../lib/vantage")
  , chalk = require("chalk")
  ;

var command
  , options = {}
  ;

commander
  .arguments('[server]')
  .option('-s, --ssl', "Connect using SSL.")
  .option('-u, --user [user]', "Connect as a given user.")
  .option('-p, --pass [user]', "Password for given user.")
  .action(function(cmd, opts) {
    command = cmd || "";
    opts = opts || {}
    options.ssl = (opts.ssl) ? true : void 0;
    options.user = (opts.user) ? opts.user : void 0;
    options.pass = (opts.pass) ? opts.pass : void 0;
  });

commander.parse(process.argv);

execute(command, options);

function execute(command, options) {
  if (command === 'tour') {
    return showTour();
  }

  var vantage = new Vantage().show();
  var connection = parseConnection(command);
  var valid = validateConnection(connection);
  if (valid !== true) {
    vantage.log(valid);
    process.exit(1);
  }

  // If there is somewhere to go, connect.
  if (command !== undefined) {
    connect(vantage, connection.server, connection.port, options);
  }
}

function parseConnection(str) {
  var parts = String(str).split(':');
  var port = (parts.length == 2) ? parts[1] : void 0;
  var server = (parts.length == 2) ? parts[0] : void 0;
  if (parts.length == 1) {
    server = (String(parts[0]).split('.').length == 4) ? parts[0] : void 0;
    port = (String(parts[0]).length < 6 && !isNaN(parts[0])) ? parts[0] : void 0;
  }
  server = (!server) ? '127.0.0.1' : server;
  port = (!port) ? '80' : port;
  return ({
    server: server,
    port: port
  });
}

function validateConnection(connection) {
  var valid = (String(connection.server).split('.').length !== 4 || isNaN(connection.port))
    ? ("\n  Invalid server/port passed: " + connection.server + ":" + connection.port + "\n")
    : true;
  return valid;
}

function connect(vantage, server, port, options) {
  return vantage.connect(server, port, options).then(function(err, data) {
    if (err) {
      console.log(err)
      vantage.log(data);
      vantage._pause();
      process.exit(1);
    }
  }).catch(function(err){
    vantage.log(err.stack);
    vantage._pause();
    process.exit(1);
  });
}

function showTour() {
  var fs = require('fs');
  var path = require('path');
  var file = '/../examples/tour/tour.js';
  if (fs.existsSync(__dirname + file)) {
    require(__dirname + file); return;
  } else {
    console.log(chalk.yellow("\n  Looks like the tour isn't included in your Vantage instance.\n  Ensure ./examples/ is in your Vantage directory.\n"));
    process.exit(1);
  }
}