node-mongo-backup-manager
=========================
## Install
You can use either use npm install:

    npm install git+https://github.com/markdicksonjr/node-mongo-backup-manager.git

Or, you can add the github repository to your project's package.json file:

    "dependencies": {
        "node-mongo-backup-manager": "git+https://github.com/markdicksonjr/node-mongo-backup-manager.git",
    }

## Usage

This is a sample taken from the test suite found within the module, with a mongo instance that requires authentication:
    var backup_manager = require('node-mongo-backup-manager');

    backup_manager.backup({
        username: values.auth.username,
        password: values.auth.password,
        database: 'backup-test',
        outputDirectory: values.outputDirectory,
        createEnclosingDirectory: true
    }, function(err_backup) {
        // check err_backup - test is complete
    });