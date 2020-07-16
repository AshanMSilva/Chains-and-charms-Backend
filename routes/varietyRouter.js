const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Varieties = require('../models/varieties');
var authenticate = require('../authenticate');


const varietyRouter = express.Router();

varietyRouter.use(bodyParser.json());

varietyRouter.route('/')
// .all((req,res,next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Varieties.find(req.query)
    .then(varieties =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(varieties);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 

})
.post(cors.corsWithOptions,authenticate.verifyAdmin, (req, res, next) => {
    Varieties.create(req.body).then(variety =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(variety);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /varieties');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Varieties.remove({}).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response); 
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

varietyRouter.route('/:varietyId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Varieties.findById(req.params.varietyId)
    .then(variety =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(variety);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})

.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /varieties/'+ req.params.varietyId);
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Varieties.findByIdAndUpdate(req.params.varietyId,{
        $set: req.body
    },
    {
        new: true
    }).then(variety =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(variety);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})

.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Varieties.findByIdAndRemove(req.params.varietyId).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response); 
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

module.exports = varietyRouter;