node-mongo-backup-manager
=========================

A simple utility for taking a backup of a mongo database

## Install

```bash
npm install node-mongo-backup-manager
```

## Usage

This is a sample taken from the test suite found within the module, with a mongo instance that requires authentication:

```javascript
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
```