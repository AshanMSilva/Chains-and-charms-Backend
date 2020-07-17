var express = require('express');
const bodyParser = require('body-parser');
var Admin = require('../models/admin');
// var User = require('../models/user');
var passport = require('passport');
const cors = require('./cors');
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

var authenticate = require('../authenticate');

var adminRouter = express.Router();
adminRouter.use(bodyParser.json());

adminRouter.options('/', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

adminRouter.get('/', cors.cors, authenticate.verifyAdmin, function(req, res, next) {
    console.log(req.query);
    let err_list = [];
    let key_arr = ['firstName', 'lastName', 'email'];
    Object.keys(req.query).forEach(element => {
        if (!key_arr.includes(element)) err_list.push(`${element} is an invalid query parameter.`);
        // const {error} = Joi.string().min(3).max(25).validate(req.query[element]);
        // if(error) err_list.push(error.details[0].message.replace('value', `${element}`));
    });
    if (err_list.length > 0) return res.status(400).send({err: err_list});

    Admin.find(req.query).select('-__v')
        .then(users =>{
            res.statusCode =200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }, err =>{
            next(err);
        }).catch(err =>{
            next(err);
        });
});
adminRouter.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
      if (err)
        return next(err);
      
      if (!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        return res.json({status: 'JWT invalid!', success: false, err: info});
      }
      else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json({status: 'JWT valid!', success: true, user: user});
  
      }
    }) (req, res);
  });

adminRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email({minDomainSegments: 2}).min(5).max(50).required(),
        password: Joi.string()
            .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&^_+\-=])[A-Za-z\d@$!%*#?&^_+\-=]{6,20}$/)
            .required(),
        firstName: Joi.string().min(3).max(25).required(),
        lastName: Joi.string().min(3).max(25).required()
    })
    let {error} = schema.validate(req.body, {abortEarly: false});
    if (error) {
        let err_list = [];
        error.details.forEach(element => {
            err_list.push(element.message);
        });
        return res.status(400).send({err: err_list});
    }

    Admin.register(new Admin({email: req.body.email}), req.body.password, (err, user) => {
        if(err) {
            res.statusCode = 400;
            next(err);
            // res.setHeader('Content-Type', 'application/json');
            // res.json({err: err});
        }
        else {
            if(req.body.firstName){
                user.firstName = req.body.firstName;
            }
            if(req.body.lastName){
                user.lastName = req.body.lastName;
            }
            user.save((err,user)=>{
                if(err){
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                    return;
                }
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                });
            });
        }
    });
});

// router.post('/login', passport.authenticate('local'), (req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'application/json');
//   res.json({success: true, status: 'You are successfully logged in!'});
// });

adminRouter.post('/login', cors.corsWithOptions, (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().min(5).max(50).required(),
        password: Joi.string().max(50).required()
    })
    const {error} = schema.validate(req.body);
    if (error) return res.status(400).send({err: error.details[0].message});

    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({success: false, status: 'Login Unsuccessful!', err: info});
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('req.logIn err', err);
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
            }

            var token = authenticate.getToken({_id: req.user._id});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Login Successful!', token: token});
        });
    }) (req, res, next);
});

adminRouter.route('/:adminId/changepassword')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.post(cors.corsWithOptions, authenticate.verifyAdmin, (req,res,next) => {
    let result = Joi.objectId().validate(req.params.adminId);
    if (result.error) return res.status(400).send({err: result.error.details[0].message});

    const schema = Joi.object({
        oldpassword: Joi.string().max(50).required(),
        newpassword: Joi.string()
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&^_+\-=])[A-Za-z\d@$!%*#?&^_+\-=]{6,20}$/)
        .required()
    })

    let {error} = schema.validate(req.body);
    if (error) return res.status(400).send({err: error.details[0].message});

    Admin.findOne({ _id: req.params.adminId },(err, user) => {
        // Check if error connecting
        if (err) {
            res.json({ success: false, message: err }); // Return error
        }
        else {
            // Check if user was found in database
            if (!user) {
                res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
            }
            else {
                user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
                    if(err) {
                        if(err.name === 'IncorrectPasswordError'){
                            res.json({ success: false, message: 'Incorrect password' }); // Return error
                        }else {
                            res.json({ success: false, message: 'Something went wrong!! Please try again after sometimes.' });
                        }
                    }
                    else {
                        res.json({ success: true, message: 'Your password has been changed successfully' });
                    }
                })
            }
        }
    });
});

adminRouter.route('/:adminId/forgotpassword')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.post(cors.corsWithOptions, (req,res,next) => {
    Admin.findOne({ _id: req.params.adminId },(err, user) => {
        // Check if error connecting
        if (err) {
            res.json({ success: false, message: err }); // Return error
        }
        else {
            // Check if user was found in database
            if (!user) {
                res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
            } else {
                user.setPassword(req.body.password, function(err, user) {
                    if(err) {
                            res.json({success:false, message: err});
                    } else {
                        user.save();
                        res.json({ success: true, message: 'Your password has been changed successfully' });
                    }
                })
            }
        }
    });
});

adminRouter.route('/:userId')
.options(cors.corsWithOptions, authenticate.verifyAdmin, (req, res) => { res.sendStatus(200); })

.get(cors.cors, (req,res,next) => {
    let {error} = Joi.objectId().validate(req.params.userId);
    if (error) return res.status(400).send({err: `${req.params.userId} is not a valid id.`});

    Admin.findById(req.params.userId)
    .then(user =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
    }, err =>{
        next(err);
    })
    .catch(err =>{
        next(err);
    });
})

.post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /users/'+ req.params.userId);
})

.put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    let result = Joi.objectId().validate(req.params.userId);
    if (result.error) return res.status(400).send({err: `${req.params.userId} is not a valid id.`});

    const schema = Joi.object({
        email: Joi.string().email({minDomainSegments: 2}).min(5).max(50),        
        firstName: Joi.string().min(3).max(25),
        lastName: Joi.string().min(3).max(25),
        image: Joi.string().min(3)
    })
    let {error} = schema.validate(req.body, {abortEarly: false});
    if (error) {
        let err_list = [];
        error.details.forEach(element => {
            err_list.push(element.message);
        });
        return res.status(400).send({err: err_list});
    }
    if(req.body.email){
        Admin.findOne({ email: req.body.email },(err, user) => {
            if(err){
                next(err);
            }
            if(user){
                res.statusCode = 400;
                // next(err);
                res.setHeader('Content-Type', 'application/json');
                res.json({err: 'That Email Address already exists.'});
            }
            if(!user){
                Admin.findByIdAndUpdate(req.params.userId, { $set: req.body }, { new: true })
                .then(user =>{
                    res.statusCode =200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);
                }, err =>{
                    next(err);
                })
                .catch(err =>{
                    next(err);
                });
            }
        })
    }
    else{
        Admin.findByIdAndUpdate(req.params.userId,{
            $set: req.body
        },
        {
            new: true
        }).then(user =>{
            res.statusCode =200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
        }, err =>{
            next(err);
        }).catch(err =>{
            next(err);
        }); 
    }

    
})

.delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    let result = Joi.objectId().validate(req.params.userId);
    if (result.error) return res.status(400).send({err: `${req.params.userId} is not a valid id.`});
    
    Admin.findByIdAndRemove(req.params.userId)
    .then(response =>{
        res.statusCode =200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    }, err =>{
        next(err);
    })
    .catch(err =>{
        next(err);
    });
});

module.exports = adminRouter;