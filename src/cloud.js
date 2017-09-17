
const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
AWS.config.update({region:'us-east-1'});

const s3 = new AWS.S3();
const sns = new AWS.SNS();
const config = require('../config.json');

module.exports = class CloudUtils {
    constructor() {
    }

    /**
     * Path to filename to upload
     * @param {string} pathName
     */
    upload(bucketName, basePath, pathName) {
        const fileName = path.basename(pathName);
        const keyName = `${basePath}/${fileName}`;

        console.log(`here ${fileName} ${bucketName} ${keyName}`);
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(pathName);
            const params = {
                Bucket: bucketName,
                Key: keyName,
                Body: readStream
            };

            readStream.on('error', (err) => reject(err.message));

            s3.upload(params, (err, data) => {
                // reject on failure
                if (err) {
                    return reject(err.message);
                }

                resolve(data);
            });
        });
    }
};
