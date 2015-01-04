var _ = require('underscore');
var fs = require('fs');
var spawn = require("child_process").spawn;

var zlib = require('zlib');
var gzip = zlib.createGzip();

module.exports = {
    backup: _backup
};

var default_backup_options = {

    // auth properties
    authenticationDatabase: null,
    username: null,
    password: null,

    // source properties
    host: null,
    port: null,     // default to 27017?
    dbPath: null,

    // target properties
    database: null,
    collection: null,

    // output properties
    compressing: true,
    outputFile: null
};

// backs up a collection to a gzipped file, without using an intermediate file
function _backup(options, callback2) {

    // extend the options to account for default options
    // NOTE: _.clone is a shallow copy, so avoid using arrays in default options
    var backup_options = _.extend(_.clone(default_backup_options), options);

    // enforce parameter requirements for streaming backup
    if(!backup_options.database || !backup_options.collection) {
        callback2('for streaming backups, both database and collection must be supplied');
        return;
    }

    var command = [];

    // apply optional authentication
    if(backup_options.username) {
        command.push('-u');
        command.push(backup_options.username);
    }
    if(backup_options.password) {
        command.push('-p');
        command.push(backup_options.password);
    }
    if(backup_options.authenticationDatabase) {
        command.push('-authenticationDatabase');
        command.push(backup_options.authenticationDatabase);
    }

    // apply host/port
    if(backup_options.host) {
        command.push('-h');

        if(backup_options.port) {
            command.push(backup_options.host + ':' + backup_options.port);
        } else {
            command.push(backup_options.host);
        }
    } else if(backup_options.port) {
        command.push('-h');
        command.push('localhost:' + backup_options.port);
    }

    // apply targets
    if(backup_options.database) {
        command.push('-db');
        command.push(backup_options.database);
    }
    if(backup_options.collection) {
        command.push('-collection');
        command.push(backup_options.collection);
    }

    // apply local db path
    if(backup_options.dbPath) {
        command.push('-dbPath');
        command.push(backup_options.dbPath);
    }

    var args = command.slice(1, command.length);

    args.push('-o');
    args.push('-');

    var child = spawn("mongodump", args);
    child.stdout.pause();

    child.on('error', function (err) {
        //console.log('error instream');
        callback2(err);
    });

    child.on('exit', function () {
        //console.log('exit instream');
        callback2();
    });

    child.on('close', function () {
        //log.info('closed');
        console.log('closed instream');
    });

    var out = fs.createWriteStream(backup_options.outputFile, {flags: 'w'}); ///Users/markdickson/Desktop/db-backups

    out.on('error', function(err) {
        //console.log('error write stream');
        callback2(err);
    });

    out.on('exit', function () {
        //console.log('exit write stream');
        callback2();
    });

    out.on('close', function () {
        //log.info('closed');
        console.log('closed write stream');
    });

    if(backup_options.compressing) {
        child.stdout.pipe(gzip).pipe(out);
    } else {
        child.stdout.pipe(out);
    }
}