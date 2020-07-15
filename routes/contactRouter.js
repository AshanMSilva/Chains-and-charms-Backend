const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const Feedbacks = require('../models/feedbacks');
const authenticate = require('../authenticate');

const contactRouter = express.Router();

contactRouter.use(bodyParser.json());

contactRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,  authenticate.verifyAdmin,(req, res, next) => {
    Feedbacks.find(req.query)
    .then(feedbacks =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
})
.post(cors.cors, (req, res, next) => {
    Feedbacks.create(req.body)
    .then(feedback =>{
        //console.log('Feedback created', feedback);
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });

})
.put(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /contact');
})
.delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /contact');
});


contactRouter.route('/:feedbackId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /contact/'+ req.params.feedbackId);
})

.post(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /contact/'+ req.params.feedbackId);
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Feedbacks.findByIdAndUpdate(req.params.feedbackId,{
        $set: req.body
    },
    {
        new: true
    }).then(feedback =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
})

.delete(cors.corsWithOptions, authenticate.verifyAdmin,  (req, res, next) => {
    Feedbacks.findByIdAndUpdate(req.params.feedbackId,{
        $set: req.body
    },
    {
          new : true
    }).then(feedback =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });
    });


module.exports = contactRouter;
