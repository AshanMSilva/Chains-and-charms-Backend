const AWS = require('aws-sdk');
const config = require('config');

const BUCKET = config.get('s3Bucket');      /*`roux-images`*/
AWS.config.update({region: 'us-west-2'});
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: config.get('s3AccessKey'),     /*'AKIAT4VJIS3G6B5X3ZTL'*/
    secretAccessKey: config.get('s3SecretKey')  /*'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'*/
});

const s3Upload = (Key, Body, res) => {
    s3.createBucket(() => {
        const params = { Bucket: BUCKET, Key, Body, ContentType: `image/jpeg` };
        s3.upload(params, (err, data) => {
            console.log(data);
            if (err) {
                console.log(err);
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({err});
                // return {err};
            }
            res.status(200).send(data);
            // return {err: null, s3Data: data};
        });
    })
}

const getS3Url = (Key) => {
    return s3.getSignedUrlPromise('getObject', {Bucket: BUCKET, Key, Expires: 300})
}

module.exports = {
    s3Upload,
    getS3Url
}