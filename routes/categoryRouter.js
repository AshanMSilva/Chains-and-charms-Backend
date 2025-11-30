const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("./cors");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const Categories = require("../models/categories");
var authenticate = require("../authenticate");
const Products = require("../models/products");

const categoryRouter = express.Router();
categoryRouter.use(bodyParser.json());

categoryRouter
  .route("/")
  // .all((req,res,next) => {
  //     res.statusCode = 200;
  //     res.setHeader('Content-Type', 'text/plain');
  //     next();
  // })
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (req, res, next) => {
    console.log(req.query);
    let err_list = [];
    let key_arr = ["name", "image"];
    Object.keys(req.query).forEach((element) => {
      if (!key_arr.includes(element))
        err_list.push(`${element} is an invalid query parameter.`);
      // const {error} = Joi.string().min(3).max(25).validate(req.query[element]);
      // if(error) err_list.push(error.details[0].message.replace('value', `${element}`));
    });
    if (err_list.length > 0) return res.status(400).send({ err: err_list });

    Categories.find(req.query)
      // .populate('subCategories')
      // .populate('products')
      .then(
        (categories) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(categories);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(25).required(),
      image: Joi.string().min(3).max(50),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ err: error.details[0].message });

    Categories.create(req.body)
      .then(
        (category) => {
          // console.log('Ctegory created', category);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(category);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })

  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /categories");
  })

  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    Categories.remove({})
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  });

categoryRouter
  .route("/:categoryId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })

  .get(cors.cors, (req, res, next) => {
    let { error } = Joi.objectId().validate(req.params.categoryId);
    if (error)
      return res
        .status(400)
        .send({ err: `${req.params.categoryId} is not a valid id.` });

    Categories.findById(req.params.categoryId)
      // .populate('subCategories')
      // .populate('products')
      .then(
        (category) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(category);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /categories/" + req.params.categoryId
    );
  })

  .put(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    console.log("/:categoryId PUT/ request body", req.body);
    let result = Joi.objectId().validate(req.params.categoryId);
    if (result.error)
      return res
        .status(400)
        .send({ err: `${req.params.categoryId} is not a valid id.` });

    const schema = Joi.object({
      name: Joi.string().min(3).max(25),
      image: Joi.string().min(3).max(50),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ err: error.details[0].message });

    Categories.findByIdAndUpdate(
      req.params.categoryId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (category) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(category);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  })

  .delete(cors.corsWithOptions, authenticate.verifyAdmin, (req, res, next) => {
    let { error } = Joi.objectId().validate(req.params.categoryId);
    if (error)
      return res
        .status(400)
        .send({ err: `${req.params.categoryId} is not a valid id.` });

    Categories.findByIdAndRemove(req.params.categoryId)
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => {
          next(err);
        }
      )
      .catch((err) => {
        next(err);
      });
  });

module.exports = categoryRouter;
