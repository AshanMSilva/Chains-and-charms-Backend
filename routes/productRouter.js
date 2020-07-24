const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const cors = require('./cors');

const Products = require('../models/products');
var authenticate = require('../authenticate');
const validater = require('../validation/productValidation');

const productRouter = express.Router();

productRouter.use(bodyParser.json());

productRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Products.find(req.query)
    .populate('category', 'name')
    .populate('variety', 'name')
    .then(products =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(products);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, async (req, res, next) => {
    // req.body contains the product and its 1st varient
    // {productCode: 'EB2086', variety: (an objectId),
    // category: (an objectId), carotSize: '108Kt', materialUsed: 'mat X',
    // image: (some String) --optional, price: 1549.99, availability: 50,
    // color: gold (or silver), size: '7.5mm' --optional}

    let err_list = validater.validateProductPost(req.body);
    if (err_list.length) return res.status(400).send({err: err_list});

    try {
        let {productCode, variety, category} = req.body;

        let ref_errors = await validater.validateCategory_Variety(category, variety);
        if(ref_errors.length) return res.status(404).send({err: ref_errors});

        // let varient = {
        //     price: req.body.price, availability: req.body.availability, color: req.body.color,
        //     carotSize: req.body.carotSize, materialUsed: req.body.materialUsed
        // };
        // if(req.body.image) product.image = req.body.image;
        // if(req.body.size) varient.size = req.body.size;
        // let product = {productCode, variety, category}
        // product.varients = [varient];

        let result = await Products.create(req.body);
        console.log('Product created', result);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(result);
        // Products.create(product).then(result =>{
        //     console.log('Product created', result);
        //     res.statusCode =200;
        //     res.setHeader('Content-Type', 'application/json');
        //     res.json(result);
        // }, err =>{
        //     next(err);
        // }).catch(err =>{
        //     next(err);
        // });
    }
    catch (err) {
        next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /categories');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Products.remove({}).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

productRouter.route('/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Products.findById(req.params.productId)
    .populate('category')
    .populate('variety')
    .then(product =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(product);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
})

.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /products/'+ req.params.productId);
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, async (req, res, next) => {
    // req.body contains fields of the product schema
    let {error} = Joi.objectId().validate(req.params.productId);
    if (error) return res.status(400).send({err: `${req.params.productId} is not a valid id.`});

    let err_list = validater.validateProductPut(req.body);
    if (err_list.length) return res.status(400).send({err: err_list});

    let ref_errors = await validater.validateCategory_Variety(req.body.category, req.body.variety);
    if(ref_errors.length) return res.status(404).send({err: ref_errors});

    Products.findByIdAndUpdate(req.params.productId, { $set: req.body }, { new: true })
    .then(product =>{
        if(!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).send({err: `A product does not exist by the id ${req.params.productId}.`});
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(product);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
})

.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Products.findByIdAndRemove(req.params.productId).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});
/*
productRouter.route('/:productId/varients')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Products.findById(req.params.productId)
    .then((product) => {
        if (product != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(product.varients);
        }
        else {
            err = new Error('Product ' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, async (req, res, next) => {
    // req.body contains fields of the varient schema
    // price, availability, materialUsed, carotSize, color, size, image (image, size is optional, others are required)
    let {error} = Joi.objectId().validate(req.params.productId);
    if (error) return res.status(400).send({err: `${req.params.productId} is not a valid id.`});
    let err_list = validater.validateVarientPost(req.body);
    if (err_list.length) return res.status(400).send({err: err_list});

    try{
        let product = await Products.findById(req.params.productId);
        if (product != null) {
            let err_msg = null;
            for (const varient of product.varients) {
                let equality_check = true;

                if (req.body.hasOwnProperty('size')) {
                    equality_check = (varient.size === req.body.size);
                }
                if (equality_check && (varient.color === req.body.color)){
                    err_msg = `A varient exists with the same attributes.`;
                    break;
                }
            }
            if (err_msg) return res.status(400).send({err: err_msg});

            product.varients.push(req.body);
            let result = await product.save();
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(result);
                // .then((product) => {
                //     Products.findById(product._id).then(product =>{
                //         res.statusCode = 200;
                //         res.setHeader('Content-Type', 'application/json');
                //         res.json(product);
                //     })

                // })
                // .catch( err => next(err) );
        }
        else {
            err = new Error('Product ' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
    }
    catch(err){
        next(err)
    }
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /products/'
        + req.params.productId + '/varients');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Products.findById(req.params.productId)
    .then((product) => {
        if (product != null) {
            for (var i = (product.varients.length -1); i >= 0; i--) {
                product.varients.id(product.varients[i]._id).remove();
            }
            product.save()
            .then((product) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(product);
            }, (err) => next(err));
        }
        else {
            err = new Error('Product ' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});
*/
// productRouter.route('/:productId/varients/:varientId')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .get(cors.cors, (req,res,next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null) {

//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(product.varients.id(req.params.varientId));
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .post(cors.corsWithOptions, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('POST operation not supported on /products/'+ req.params.productId
//         + '/varients/' + req.params.varientId);
// })
// .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null) {
//             if(req.body.name){
//                 product.varients.id(req.params.varientId).name = req.body.name;
//             }
//             if(req.body.price){
//                 product.varients.id(req.params.varientId).price = req.body.price;
//             }
//             if(req.body.availability){
//                 product.varients.id(req.params.varientId).availability = req.body.availability;
//             }
//             if(req.body.sales){
//                 product.varients.id(req.params.varientId).sales = req.body.sales;
//             }
//             product.save();
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(product.varients.id(req.params.varientId));
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));

// })
// .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null) {
//             // if(req.user._id.equals(category.subCategories.id(req.params.subCategorytId).author)){
//                 product.varients.id(req.params.varientId).remove();
//                 product.save()
//                 .then((product) => {
//                     Products.findById(product._id).then(product =>{
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json(product);
//                     })

//                 }, (err) => next(err));
//             // }
//             // else{
//             //     err = new Error('Only author can update a comment');
//             //     err.status = 403;
//             //     return next(err);
//             // }

//         }
//         else if (product == null) {
//             err = new Error('Product ' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });

// productRouter.route('/:productId/varients/:varientId/attributes')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .get(cors.cors, (req,res,next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null) {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(product.varients.id(req.params.varientId).attributes);
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null) {
//             product.varients.id(req.params.varientId).attributes.push(req.body);
//             product.save().then(
//                 product =>{
//                     Products.findById(product._id).then(
//                         product =>{
//                             res.statusCode = 200;
//                             res.setHeader('Content-Type', 'application/json');
//                             res.json(product.varients.id(req.params.varientId));
//                         }
//                     )
//                 },(err) => next(err)
//             )
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /varients/'
//         + req.params.varientId + '/attributes');
// })
// .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null) {
//             for (var i = (product.varients.id(req.params.varientId).attributes.length -1); i >= 0; i--) {
//                 product.varients.id(req.params.varientId).attributes.id(product.varients.id(req.params.varientId).attributes[i]._id).remove();
//             }
//             product.save()
//             .then((product) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(product.varients.id(req.params.varientId));
//             }, (err) => next(err));
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else {
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });

// productRouter.route('/:productId/varients/:varientId/attributes/:attributeId')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// .get(cors.cors, (req,res,next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null && product.varients.id(req.params.varientId).attributes.id(req.params.attributeId) != null) {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             res.json(product.varients.id(req.params.varientId).attributes.id(req.params.attributeId));
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else if(product.varients.id(req.params.varientId) == null){
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else{
//             err = new Error('Attributes ' + req.params.attributeId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .post(cors.corsWithOptions, (req, res, next) => {
//     res.statusCode = 403;
//     res.end('POST operation not supported on /varients/'+ req.params.varientId
//         + '/attributes/' + req.params.attributeId);
// })
// .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null && product.varients.id(req.params.varientId).attributes.id(req.params.attributeId) != null) {
//             if (req.body.name) {
//                 product.varients.id(req.params.varientId).attributes.id(req.params.attributeId).name = req.body.name;
//             }
//             if (req.body.value) {
//                 product.varients.id(req.params.varientId).attributes.id(req.params.attributeId).value = req.body.value;
//             }
//             product.save()
//             .then((product) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(product.varients.id(req.params.varientId));
//             }, (err) => next(err));
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else if(product.varients.id(req.params.varientId) == null){
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else{
//             err = new Error('Attributes ' + req.params.attributeId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// })
// .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
//     Products.findById(req.params.productId)
//     .then((product) => {
//         if (product != null && product.varients.id(req.params.varientId) != null && product.varients.id(req.params.varientId).attributes.id(req.params.attributeId) != null) {
//             product.varients.id(req.params.varientId).attributes.id(req.params.attributeId).remove();
//             product.save()
//             .then((product) => {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 res.json(product.varients.id(req.params.varientId));
//             }, (err) => next(err));
//         }
//         else if (product == null) {
//             err = new Error('Product' + req.params.productId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else if(product.varients.id(req.params.varientId) == null){
//             err = new Error('Varients ' + req.params.varientId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//         else{
//             err = new Error('Attributes ' + req.params.attributeId + ' not found');
//             err.status = 404;
//             return next(err);
//         }
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });


productRouter.route('/categories/varients/:varientId/attributes/:attributeId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Products.findById(req.params.productId)
    .then((product) => {
        if (product != null && product.varients.id(req.params.varientId) != null && product.varients.id(req.params.varientId).attributes.id(req.params.attributeId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(product.varients.id(req.params.varientId).attributes.id(req.params.attributeId));
        }
        else if (product == null) {
            err = new Error('Product' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
        else if(product.varients.id(req.params.varientId) == null){
            err = new Error('Varients ' + req.params.varientId + ' not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Attributes ' + req.params.attributeId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /varients/'+ req.params.varientId
        + '/attributes/' + req.params.attributeId);
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Products.findById(req.params.productId)
    .then((product) => {
        if (product != null && product.varients.id(req.params.varientId) != null && product.varients.id(req.params.varientId).attributes.id(req.params.attributeId) != null) {
            if (req.body.name) {
                product.varients.id(req.params.varientId).attributes.id(req.params.attributeId).name = req.body.name;
            }
            if (req.body.value) {
                product.varients.id(req.params.varientId).attributes.id(req.params.attributeId).value = req.body.value;
            }
            product.save()
            .then((product) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(product.varients.id(req.params.varientId));
            }, (err) => next(err));
        }
        else if (product == null) {
            err = new Error('Product' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
        else if(product.varients.id(req.params.varientId) == null){
            err = new Error('Varients ' + req.params.varientId + ' not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Attributes ' + req.params.attributeId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Products.findById(req.params.productId)
    .then((product) => {
        if (product != null && product.varients.id(req.params.varientId) != null && product.varients.id(req.params.varientId).attributes.id(req.params.attributeId) != null) {
            product.varients.id(req.params.varientId).attributes.id(req.params.attributeId).remove();
            product.save()
            .then((product) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(product.varients.id(req.params.varientId));
            }, (err) => next(err));
        }
        else if (product == null) {
            err = new Error('Product' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
        else if(product.varients.id(req.params.varientId) == null){
            err = new Error('Varients ' + req.params.varientId + ' not found');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Attributes ' + req.params.attributeId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


productRouter.route('/:productId/review')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, (req,res,next) => {

    let err_list = validater.validateReviewPost(req.body);
    if (err_list.length) return res.status(400).send({err: err_list});

    Products.findById(req.params.productId)
    .then((product) => {
      var reviewsList = product.reviews;
      //console.log(reviewsList);
      var ratingSum = (product.totalRating)*(reviewsList.length);
      var newRating = (ratingSum + req.body.rating)/(reviewsList.length+1);
      //console.log(newRating);
      reviewsList.push(req.body);
      Products.findByIdAndUpdate(req.params.productId, { reviews:reviewsList,totalRating:newRating}, { new: true })
      .then(product =>{
        if(!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).send({err: `A product does not exist by the id ${req.params.productId}.`});
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(product);
      }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
}, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

module.exports = productRouter;
