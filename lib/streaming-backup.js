var spawn = require("child_process").spawn;

var zlib = require('zlib');
var gzip = zlib.createGzip();

module.exports = {
    backup: _backup
};

// backs up a collection to a gzipped file, without using an intermediate file
function _backup(backup_options, command, callback2) {
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

    var out = fs.createWriteStream('/Users/markdickson/Desktop/db-backups/backup.gz', {flags: 'w'}); ///Users/markdickson/Desktop/db-backups

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