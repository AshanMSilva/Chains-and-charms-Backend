const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('./cors');

const imgFilter = (req, file, cb) => {
    console.log(file);
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

const resizeAndSave = (width, height, imgfit, bgalpha, file, filePath) => {
    console.log(filePath);
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
    .toFile(filePath)
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

const categoryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/categories');
    },

    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1];
        cb(null, String(req.params.id)+'.'+extension)
    }
});
const categoryUpload = multer({ storage: categoryStorage, fileFilter: imageFileFilter});

const varietyStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/varieties');
    },

    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1];
        cb(null, String(req.params.id)+'.'+extension)
    }
});
const varietyUpload = multer({ storage: varietyStorage, fileFilter: imageFileFilter});


const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/products');
    },

    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1];
        cb(null, String(req.params.id)+'.'+extension)
    }
});


const productUpload = multer({ storage: productStorage, fileFilter: imageFileFilter});

// const profilePictureStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/images/profilePictures');
//     },

//     filename: (req, file, cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, String(req.params.id)+'.'+extension)
//     }
// });


// const profilePictureUpload = multer({ storage: profilePictureStorage, fileFilter: imageFileFilter});



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
    const filePath = `public/images/categories/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    resizeAndSave(800, 600, 'inside', 0.2, req.file, filePath)
    .then(info => {
        console.log(info);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({filename: `${req.params.id}.${info.format}`});
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

uploadRouter.route('/variety/:id')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, /*varietyUpload.single('imageFile'),*/ uploadImage, (req, res) => {
    const filePath = `public/images/varieties/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    resizeAndSave(500, 500, 'fill', 1, req.file, filePath)
    .then(info => {
        console.log(info);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({filename: `${req.params.id}.${info.format}`});
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
    const filePath = `public/images/products/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    resizeAndSave(438, 438, 'fill', 1, req.file, filePath)
    .then(info => {
        console.log(info);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({filename: `${req.params.id}.${info.format}`});
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
    const filePath = `public/images/profilePictures/${req.params.id}.${req.file.mimetype.split('/')[1]}`;
    resizeAndSave(500, 500, 'inside', 0.2, req.file, filePath)
    .then(info => {
        console.log(info);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({filename: `${req.params.id}.${info.format}`});
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

module.exports = uploadRouter;