const express = require('express')
const mongoose = require('mongoose')
const logger = require('morgan');
require('./db/mongoose')

const userrouter = require('./router/user')
const taskrouter = require('./router/task')
const resturantrouter = require('./router/resturant')

const { serialize } = require('bson')

const app = express()
const port = process.env.PORT

// as we are sending raw json data from postman
app.use(express.json())
app.use(userrouter)
app.use(taskrouter)
app.use(resturantrouter)

app.use(logger("dev"));

module.exports = app