const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Categories = require('../models/categories');
var authenticate = require('../authenticate');


const categoryRouter = express.Router();

categoryRouter.use(bodyParser.json());

categoryRouter.route('/')
// .all((req,res,next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Categories.find(req.query)
    // .populate('subCategories')
    .populate('products')
    .then(categories =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(categories);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 

})
.post(cors.corsWithOptions,authenticate.verifyAdmin, (req, res, next) => {
    Categories.create(req.body).then(category =>{
        console.log('Ctegory created', category);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(category);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /categories');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.remove({}).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response); 
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

categoryRouter.route('/:categoryId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Categories.findById(req.params.categoryId)
    // .populate('subCategories')
    .populate('products')
    .then(category =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(category);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})

.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /categories/'+ req.params.categoryId);
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.findByIdAndUpdate(req.params.categoryId,{
        $set: req.body
    },
    {
        new: true
    }).then(category =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(category);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})

.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.findByIdAndRemove(req.params.categoryId).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response); 
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
    });

categoryRouter.route('/:categoryId/products')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Categories.findById(req.params.categoryId)
    // .populate('subCategories')
    .populate('products')
    .then((category) => {
        if (category != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(category.products);
        }
        else {
            err = new Error('Category ' + req.params.categoryId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.findById(req.params.categoryId)
    .then((category) => {
        if (category != null) {
            // req.body.author = req.user._id;
            category.products.push(req.body.id);
            category.save()
            .then((category) => {
                Categories.findById(category._id).populate('products').then(category =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(category); 
                })
                               
            }, (err) => next(err));
        }
        else {
            err = new Error('Category ' + req.params.categoryId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /categories/'
        + req.params.categoryId + '/products');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.findById(req.params.categoryId)
    .then((category) => {
        if (category != null) {
            for (var i = (category.products.length -1); i >= 0; i--) {
                category.products.id(category.products[i]._id).remove();
            }
            category.save()
            .then((category) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(category);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Category ' + req.params.categoryId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});





categoryRouter.route('/:categoryId/products/:productId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Categories.findById(req.params.categoryId)
    .populate('products')
    .then((category) => {
        if (category != null && category.products.id(req.params.productId) != null) {

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(category.products.id(req.params.productId));
        }
        else if (category == null) {
            err = new Error('Category' + req.params.categoryId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Products ' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /categories/'+ req.params.categoryId
        + '/products/' + req.params.productId);
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /categories/'+ req.params.categoryId
        + '/products/' + req.params.productId);
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.findById(req.params.categoryId)
    .populate('products')
    .then((category) => {
        if (category != null) {
            let products = category.products;
            var ind = null;
            for (let index = 0; index < products.length; index++) {
                const prod = products[index];
                // console.log(typeof(req.params.subCategoryId));
                // console.log(typeof(cat._id,this.toString()));
                if(prod._id.toString() === req.params.productId){
                    ind = index;
                    
                    break;
                }
                
            }
            if(ind !=null){
                category.products.splice(ind,1);
                category.save()
                .then((category) => {
                    Categories.findById(category._id).populate('products').then(category =>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(category);
                    })
                                    
                }, (err) => next(err));
            }
            else {
                err = new Error('Products ' + req.params.productId + ' not found');
                err.status = 404;
                return next(err);            
            }
            // console.log(ind);
            // if(req.user._id.equals(category.subCategories.id(req.params.subCategorytId).author)){
                
            // }
            // else{
            //     err = new Error('Only author can update a comment');
            //     err.status = 403;
            //     return next(err);
            // }
            
        }
        else {
            err = new Error('Category ' + req.params.categoryId + ' not found');
            err.status = 404;
            return next(err);
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = categoryRouter;