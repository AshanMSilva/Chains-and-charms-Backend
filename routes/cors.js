const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['https://rouxandglamour.herokuapp.com', 'https://rouxandglamourdashboard.herokuapp.com','https://rouxandglamour.com','https://www.rouxandglamour.com','https://ubctest.cybersource.com','https://ubc.cybersource.com'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    // console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);