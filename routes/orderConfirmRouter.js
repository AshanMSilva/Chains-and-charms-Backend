const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const Fawn = require('fawn');
const cors = require('./cors');

const Orders = require('../models/orders');
var authenticate = require('../authenticate');
const Products = require('../models/products');
// Fawn.init(mongoose);

const orderConfirmRouter = express.Router();

orderConfirmRouter.use(bodyParser.json());

orderConfirmRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

.post(cors.corsWithOptions, async (req, res, next) =>  {
    try {
        let order = await Orders.findOne({reference_number: req.body.req_reference_number});
        let items = [];
        let count = req.body.req_line_item_count;
        if(order === null){
            for (let i=0; i<count; i++) {
                items.push({
                    product_id: req.body['req_item_'+i+'_sku'],
                    quantity: req.body['req_item_'+i+'_quantity']
                });
                //console.log(req.body['req_item_'+i+'_quantity']);
            }
            let newOrder = new Orders({
                reference_number : req.body.req_reference_number,
                status : req.body.decision,
                amount : req.body.req_amount,
                orderItems : items,
                contactDetails : {
                    bill_to_forename: req.body.req_bill_to_forename,
                    bill_to_surname : req.body.req_bill_to_surname,
                    bill_to_email: req.body.req_bill_to_email,
                    bill_to_phone: req.body.req_bill_to_phone,
                    bill_to_address_line1: req.body.req_bill_to_address_line1,
                    bill_to_address_city: req.body.req_bill_to_address_city,
                    bill_to_address_state: req.body.req_bill_to_address_state,
                    bill_to_address_country: req.body.req_bill_to_address_country,
                    bill_to_address_postal_code: req.body.req_bill_to_address_postal_code,
                    ship_to_address_line1: req.body.req_ship_to_address_line1,
                    ship_to_address_city: req.body.req_ship_to_address_city,
                    ship_to_address_state: req.body.req_ship_to_address_state,
                    ship_to_address_country: req.body.req_ship_to_address_country,
                    ship_to_address_postal_code: req.body.req_ship_to_address_postal_code
                }
            })
            // let task = Fawn.Task()
            // task.save('orders', newOrder);
            // for (let i = 0; i < count; i++) {
            //     task.update(
            //         'products',
            //         { _id: req.body['req_item_'+i+'_sku'] },
            //         { $inc: { sales: req.body['req_item_'+i+'_quantity'], availability: -req.body['req_item_'+i+'_quantity'] } }
            //     );
            //     task.options({viaSave: true});
            // }
            // // task.update('products', {_id: '5f302227e7a75f23f4f93f09'}, {$inc: {sales: 1, availability: -1}});
            // task.run();

            await newOrder.save();

            if (req.body.decision === 'ACCEPT'){
                for (let i = 0; i < count; i++) {
                    await Products.findByIdAndUpdate(
                        req.body['req_item_'+i+'_sku'],
                        {
                            $inc: {
                                sales: req.body['req_item_'+i+'_quantity'],
                                availability: -req.body['req_item_'+i+'_quantity']
                            }
                        }
                    )
                }
            }

            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(newOrder);
                // .then(newOrder => {
                //     console.log('Order created', newOrder);
                //     res.statusCode =200;
                //     res.setHeader('Content-Type', 'application/json');
                //     res.json(newOrder);
                // },
                // err => {
                //     next(err);
                // }).catch(err => {
                //     next(err);
                // });
        }
        else {
            // new Fawn.Task()
            // .update('orders', { reference_number: req.body.req_reference_number }, { $set: { status: req.body.decision } })
            let newOrder = await Orders.findOneAndUpdate(
                {reference_number: req.body.req_reference_number},
                {status: req.body.decision},
                {new: true}
            )
            
            if (req.body.decision === 'ACCEPT'){
                for (let i = 0; i < count; i++) {
                    await Products.findByIdAndUpdate(
                        req.body['req_item_'+i+'_sku'],
                        {
                            $inc: {
                                sales: req.body['req_item_'+i+'_quantity'],
                                availability: -req.body['req_item_'+i+'_quantity']
                            }
                        }
                    )
                }
            }
            // let newOrder = await Orders.findOne({ reference_number: req.body.req_reference_number });
            console.log('Order created', newOrder);
            res.statusCode =200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newOrder);
        }
    }
    catch(err) {
        next(err);
    }
})

module.exports = orderConfirmRouter;
