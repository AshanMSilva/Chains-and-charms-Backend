const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Orders = require('../models/orders');
var authenticate = require('../authenticate');


const orderConfirmRouter = express.Router();

orderConfirmRouter.use(bodyParser.json());

orderConfirmRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions,(req, res, next) =>  {
    Orders.findOne({reference_number:req.body.req_reference_number})
    .then(order =>{
        var items = [];
        var count = req.body.req_line_item_count;
        if(order == null){
          for (i=0; i<count; i++){
            var itemQuantity = req.body['req_item_'+i+'_quantity'];
            var id = req.body['req_item_'+i+'_sku'];
            items.push({  product_id: id,
                          quantity: itemQuantity
                       });
            //console.log(req.body['req_item_'+i+'_quantity']);
          }
          Orders.create({
            reference_number : req.body.req_reference_number,
            status : req.body.decision,
            amount : req.body.req_amount,
            orderItems : items,
            contactDetails : {  bill_to_forename:req.body.req_bill_to_forename,
                                bill_to_surname :req.body.req_bill_to_surname,
                                bill_to_email:req.body.req_bill_to_email,
                                bill_to_phone:req.body.req_bill_to_phone,
                                bill_to_address_line1:req.body.req_bill_to_address_line1,
                                bill_to_address_city:req.body.req_bill_to_address_city,
                                bill_to_address_state:req.body.req_bill_to_address_state,
                                bill_to_address_country:req.body.req_bill_to_address_country,
                                bill_to_address_postal_code:req.body.req_bill_to_address_postal_code,
                                ship_to_address_line1:req.body.req_ship_to_address_line1,
                                ship_to_address_city:req.body.req_ship_to_address_city,
                                ship_to_address_state:req.body.req_ship_to_address_state,
                                ship_to_address_country:req.body.req_ship_to_address_country,
                                ship_to_address_postal_code:req.body.req_ship_to_address_postal_code
                             }

          })
          .then(newOrder =>{
            console.log('Order created', newOrder);
            res.statusCode =200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newOrder);
          }, err =>{
              next(err);
              }).catch(err =>{
                next(err);
                });
    } else {
          Orders.findOneAndUpdate({reference_number:req.body.req_reference_number},{status : req.body.decision},{new : true})
          .then(newOrder =>{
            console.log('Order created', newOrder);
            res.statusCode =200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newOrder);
         }, err =>{
              next(err);
              }).catch(err =>{
                next(err);
                });
        }
    }, err =>{
        next(err);
    }).catch(err =>{
        next(err);
    });

})

module.exports = orderConfirmRouter;
