const { Client } = require('ssh2');
const mongoose = require('mongoose');

function connectToDocumentDB() {
    return new Promise((resolve, reject) => {
        const sshConfig = {
            host: '54.167.48.52',
            port: 22,
            username: 'ec2-user',
            privateKey: require('fs').readFileSync('./pemsshfiles/lovoj.pem')
        };

        const forwardConfig = {
            srcHost: '127.0.0.1',
            srcPort: 27017, // local port
            dstHost: 'louojapp.cluster-chp71biqmdit.us-east-1.docdb.amazonaws.com',
            dstPort: 27017 // DocumentDB port
        };

        const sshClient = new Client();

        sshClient.on('ready', () => {
            console.log('SSH connection established.');
            sshClient.forwardOut(
                forwardConfig.srcHost,
                forwardConfig.srcPort,
                forwardConfig.dstHost,
                forwardConfig.dstPort,
                (err, stream) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Establish Mongoose connection using the stream
                    mongoose.connect('mongodb://mongodb:mongodb123@louojapp.cluster-chp71biqmdit.us-east-1.docdb.amazonaws.com:27017/lovojtesting?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false', {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }).then(() => {
                        console.log('Connected to MongoDB');
                        resolve();
                    }).catch(err => {
                        reject(err);
                    });
                }
            );
        });

        sshClient.connect(sshConfig);
    });
}

module.exports = connectToDocumentDB;
