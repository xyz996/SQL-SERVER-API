'use strict';

const PORT = 3000;

var express = require('express')
var bodyParser = require('body-parser')
var app = express();
var routes = require('./routes/index')

var publicDir = (__dirname + '/public');

app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", routes);

app.listen(PORT, () => {
    console.log("API IS RUNNING")
})