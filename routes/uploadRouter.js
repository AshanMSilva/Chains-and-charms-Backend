const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('./cors');
const AWS = require('aws-sdk');
const config = require('config');

const BUCKET = config.get('s3Bucket');      /*`roux-images`*/
AWS.config.update({region: 'us-west-2'});
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: config.get('s3AccessKey'),     /*'AKIAT4VJIS3G6B5X3ZTL'*/
    secretAccessKey: config.get('s3SecretKey')  /*'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'*/
});

const s3Upload = (Key, Body, ContentType, res) => {
    s3.createBucket(() => {
        const params = { Bucket: BUCKET, Key, Body, ContentType };
        s3.upload(params, (err, data) => {
            console.log(data);
            console.log(err);
            if (err) {
                console.log('if (err)');
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

const imgFilter = (req, file, cb) => {
    console.log('imgFilter', file);
    const extension_check = file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG)$/);
    const mime_check = file.mimetype.startsWith("image") && file.mimetype.match(/(jpg|jpeg|png)$/i);
    if (extension_check && mime_check) {
        cb(null, true);
    }
    else {
        cb("Please upload only images.", false);
    }
};

const uploadFile =  multer({
    storage: multer.memoryStorage(),
    fileFilter: imgFilter
})
.single('imageFile');

const uploadImage = (req, res, next) => {
    uploadFile(req, res, err => {
        if (err) {
            return res.send(err);
        }
        next();
    });
};

const resizeAndSave = (width, height, imgfit, bgalpha, file) => {
    // console.log(filePath);
    return sharp(file.buffer)
    .resize(width, height, {
        fit: imgfit,    // cover | contain | inside | fill | outside -- see documentation https://sharp.pixelplumbing.com/api-resize
        background: { r: 255, g: 255, b: 255, alpha: bgalpha },
        // withoutEnlargement: true
    })
    // .extend({
    //     top: 10,
    //     bottom: 10,
    //     left: 10,
    //     right: 10,
    //     background: { r: 255, g: 255, b: 255, alpha: 1 }
    // })
    .toFormat(file.mimetype.split('/')[1])
    .toBuffer();
    // .then(info => { return {output: info, err: null} })
    // .catch(err => { return {output: null, err} });

}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

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
.post(cors.corsWithOptions, authenticate.verifyAdmin, /*categoryUpload.single('imageFile'),*/ uploadImage, (req, res) => {
    // const filePath = `public/images/categories/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `categories/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    resizeAndSave(800, 600, 'inside', 0.2, req.file)
    .then(data => {
        s3Upload(Key, data, req.file.mimetype, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
    // resizeAndSave(800, 600, 'inside', 0.2, req.file, filePath)
    // .then(info => {
    //     console.log(info);
    //     res.setHeader('Content-Type', 'application/json');
    //     res.status(200).json({filename: `${req.params.id}.${info.format}`});
    // })
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'application/json');
    // res.json(req.file);
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
.post(cors.corsWithOptions, authenticate.verifyAdmin, /*varietyUpload.single('imageFile'),*/ uploadImage, (req, res) => {
    // const filePath = `public/images/varieties/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `varieties/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    // resizeAndSave(500, 500, 'fill', 1, req.file, filePath)
    // .then(info => {
    //     console.log(info);
    //     res.setHeader('Content-Type', 'application/json');
    //     res.status(200).json({filename: `${req.params.id}.${info.format}`});
    // })
    resizeAndSave(500, 500, 'fill', 1, req.file)
    .then(data => {
        s3Upload(Key, data, req.file.mimetype, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'application/json');
    // res.json(req.file);
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
.post(cors.corsWithOptions, authenticate.verifyAdmin, /*productUpload.single('imageFile'),*/ uploadImage, (req, res) => {
    // const filePath = `public/images/products/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `products/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    // resizeAndSave(438, 438, 'fill', 1, req.file, filePath)
    // .then(info => {
    //     console.log(info);
    //     res.setHeader('Content-Type', 'application/json');
    //     res.status(200).json({filename: `${req.params.id}.${info.format}`});
    // })
    resizeAndSave(1000, 1000, 'fill', 1, req.file)
    .then(data => {
        s3Upload(Key, data, req.file.mimetype, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'application/json');
    // res.json(req.file);
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
.post(cors.corsWithOptions, /*profilePictureUpload.single('imageFile'),*/ uploadImage, (req, res) => {
    // const filePath = `public/images/profilePictures/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    const Key = `profilePictures/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
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
        s3Upload(Key, data, req.file.mimetype, res);
    })
    .catch(err => {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({err});
    })
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'application/json');
    // res.json(req.file);
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