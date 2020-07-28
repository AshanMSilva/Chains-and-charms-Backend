const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Products = require('../models/products');
const Categories = require('../models/categories');

var authenticate = require('../authenticate');


const searchRouter = express.Router();

searchRouter.use(bodyParser.json());

searchRouter.route('/product')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    // console.log(req.query);
    Products.find({"name":RegExp(req.query.keyword,"i")})
    .populate('varients')
    .populate('category')
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
.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /search');})
.put(cors.corsWithOptions,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /search');
})
.delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /search');
});

searchRouter.route('/category')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    // console.log(req.query);
    Categories.find({"name":RegExp(req.query.keyword,"i")})
    .populate('varients')
    .populate('category')
    .then(categories =>{
        if(categories){
            res.statusCode =200; 
            res.setHeader('Content-Type', 'application/json');
            res.json(categories);
        }

    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 

})
.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /search');})
.put(cors.corsWithOptions,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /search');
})
.delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /search');
});

searchRouter.route('/brand')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    // console.log(req.query);
    Products.find({"brand":RegExp(req.query.keyword,"i")})
    // .populate('varients')
    .populate('category')
    .then(products =>{
        if(products){
            res.statusCode =200; 
            res.setHeader('Content-Type', 'application/json');
            res.json(products);
        }

    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 

})
.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /search');})
.put(cors.corsWithOptions,  (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /search');
})
.delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /search');
});


module.exports = searchRouter;