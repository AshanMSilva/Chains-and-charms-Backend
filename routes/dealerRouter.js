const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Dealers = require('../models/dealers');
var authenticate = require('../authenticate');


const dealerRouter = express.Router();

dealerRouter.use(bodyParser.json());

dealerRouter.route('/')
// .all((req,res,next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
// })
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dealers.find(req.query)
    .then(delaers =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dealers);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 

})
.post(cors.corsWithOptions,authenticate.verifyAdmin, (req, res, next) => {
    Dealers.create(req.body).then(dealer =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dealer);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})
.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dealers');
})
.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Dealers.remove({}).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response); 
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

dealerRouter.route('/:dealerId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Dealers.findById(req.params.dealerId)
    .then(dealer =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dealer);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})

.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dealers/'+ req.params.dealerId);
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Dealers.findByIdAndUpdate(req.params.dealerId,{
        $set: req.body
    },
    {
        new: true
    }).then(dealer =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dealer);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    }); 
})

.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Dealers.findByIdAndRemove(req.params.dealerId).then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response); 
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
});

module.exports = dealerRouter;