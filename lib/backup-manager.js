var _ = require('underscore');
var exec = require('child_process').exec;
var fs = require('fs');
var fstream = require('fstream');
var moment = require('moment');
var rimraf = require('rimraf');
var tar = require('tar');
var zlib = require('zlib');

var streaming_backup = require('./streaming-backup');

module.exports = {
    backup: _backup,
    backupViaStream: streaming_backup.backup
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
    outputDirectory: null,
    compressing: true,
    createEnclosingDirectory: true
};

function _backup(options, callback2) {

    // extend the options to account for default options
    // NOTE: _.clone is a shallow copy, so avoid using arrays in default options
    var backup_options = _.extend(_.clone(default_backup_options), options);

    var command = ['mongodump'];

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
        command.push('-d');
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

    var output_destination = backup_options.outputDirectory;

    // if we're backing up an entire mongo instance, we should make a directory for it with a timestamp
    if(backup_options.createEnclosingDirectory) {
        var directory_name = moment().format('YYYY-MM-DDHHmmss');

        if(!output_destination) {
            output_destination = './' + directory_name;
        } else {
            output_destination += '/' + directory_name;
        }

        // create the directory, if it doesn't exist
        try {
            fs.mkdirSync(output_destination);
        } catch(e) {
            //if ( e.code != 'EEXIST' ) throw e;
        }
    }

    // apply output destination
    if(output_destination) {
        command.push('-o');
        command.push(output_destination);
    }

    var child = exec(command.join(' '), function (error, stdout, stderr) {
        if (error) {
            console.log('exec error: ' + error);
        }

        if(!backup_options.compressing) {
            callback2(error);
            return;
        }

        if(!output_destination) {
            callback2();
            return;
        }

        var writer = fstream.Writer({
            path: output_destination + '.tar.gz'
        });

        fstream.Reader({ 'path': output_destination, 'type': 'Directory' }) /* Read the source directory */
            .pipe(tar.Pack())   // Convert the directory to a .tar file */
            .pipe(zlib.Gzip())  // Compress the .tar file */
            .pipe(writer);      // Give the output file name */

        writer.on('error', function(err) {
            callback2(err);
        });

        writer.on('close', function() {
            rimraf.sync(output_destination);
            callback2();
        });
    });
}

