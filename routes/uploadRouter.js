const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('./cors');
const AWS = require('aws-sdk');
const config = require('config');
const { s3Upload, getS3Url } = require('../helpers/aws');
const { upload, uploadImage, resizeAndSave} = require('../helpers/imgEditor')

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

uploadRouter.route('/category/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, uploadImage, (req, res) => {
    // const filePath = `public/images/categories/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `categories/${req.params.id}.jpeg`;
    resizeAndSave(1200, 800, 'inside', 0.2, req.file)
    .then(data => {
        s3Upload(Key, data, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

uploadRouter.route('/variety/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, uploadImage, (req, res) => {
    // const filePath = `public/images/varieties/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `varieties/${req.params.id}.jpeg`;
    resizeAndSave(1200, 1200, 'inside', 1, req.file)
    .then(data => {
        s3Upload(Key, data, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

uploadRouter.route('/product/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, uploadImage, (req, res) => {
    // const filePath = `public/images/products/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    // const Key = `products/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `products/${req.params.id}.jpeg`;
    // resizeAndSave(438, 438, 'fill', 1, req.file, filePath)
    // .then(info => {
    //     console.log(info);
    //     res.setHeader('Content-Type', 'application/json');
    //     res.status(200).json({filename: `${req.params.id}.${info.format}`});
    // })
    resizeAndSave(1752, 1752, 'contain', 1, req.file)
    .then(data => {
        s3Upload(Key, data, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

uploadRouter.route('/profilePicture/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, uploadImage, (req, res) => {
    // const filePath = `public/images/profilePictures/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `profilePictures/${req.params.id}.jpeg`;
    resizeAndSave(500, 500, 'inside', 0.2, req.file)
    .then(data => {
        // console.log(info);
        // res.setHeader('Content-Type', 'application/json');
        // res.status(200).json({filename: `${req.params.id}.${info.format}`});
        // let result = s3Upload(Key, data, req.file.mimetype);
        // console.log('result', result);
        // if (result.err) {
        //     res.setHeader('Content-Type', 'application/json');
        //     return res.status(400).json({err});
        // }
        // res.status(200).send(result.s3Data);
        s3Upload(Key, data, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

uploadRouter.route('/s3Url')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload/s3Url');
})
.post(cors.corsWithOptions, (req, res) => {
    // req.body contains {key: '...'} -- image field in mongo db document
    getS3Url(req.body.key)
    .then(url => {
        console.log(url);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send({url});
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
})

module.exports = uploadRouter;