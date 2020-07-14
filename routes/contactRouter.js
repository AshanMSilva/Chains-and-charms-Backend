const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const Feedbacks = require('../models/feedbacks');

const contactRouter = express.Router();

contactRouter.use(bodyParser.json());

contactRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /contact');
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


module.exports = contactRouter;
