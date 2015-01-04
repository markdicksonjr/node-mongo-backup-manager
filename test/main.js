var values = require('./values');
var backup_manager = require('../lib/backup-manager');

process.setMaxListeners(0);

module.exports = {

    setUp: function (callback) {
        callback();
    },

    tearDown: function (callback) {
        callback();
    },

    integration: {

        single_database_enclosed: function(test) {
            backup_manager.backup({
                username: values.auth.username,
                password: values.auth.password,
                database: 'backup-test',
                outputDirectory: '/Users/markdickson/Desktop/db-backups',
                createEnclosingDirectory: true
            }, function(err_backup) {
                test.ok(true, 'simple');
                test.done();
            });
        },

        instance_enclosed: function(test) {
            backup_manager.backup({
                username: values.auth.username,
                password: values.auth.password,
                outputDirectory: '/Users/markdickson/Desktop/db-backups',
                createEnclosingDirectory: true
            }, function(err_backup) {
                test.ok(true, 'simple');
                test.done();
            });
        },

        streaming: function(test) {
            backup_manager.backup({
                username: values.auth.username,
                password: values.auth.password,
                database: 'backup-test',
                collection: 'test-collection',
                streaming: true,
                createEnclosingDirectory: false
            }, function(err_backup) {

                test.ok(true, 'streaming');
                test.done();
            });
        }
    }
};