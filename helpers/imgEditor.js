const multer = require('multer');
const sharp = require('sharp');

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
    return sharp(file.buffer)
    .resize(width, height, {
        fit: imgfit,    // cover | contain | inside | fill | outside -- see documentation https://sharp.pixelplumbing.com/api-resize
        background: { r: 232, g: 227, b: 231, alpha: bgalpha },
        // withoutEnlargement: true
    })
    // .extend({
    //     top: 10,
    //     bottom: 10,
    //     left: 10,
    //     right: 10,
    //     background: { r: 255, g: 255, b: 255, alpha: 1 }
    // })
    // .toFormat(file.mimetype.split('/')[1])
    .jpeg({ quality: 100, progressive: true})
    // .png({compressionLevel: 2})
    .toBuffer();
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

module.exports = {
    upload, uploadImage, resizeAndSave
}