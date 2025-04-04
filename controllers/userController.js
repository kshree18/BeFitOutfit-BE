const { Router } = require('express')
const m$user = require('../modules/user.module.js')
const response = require('../helpers/response')
const middleware =require('../helpers/midleware')
// const db = require("../config/mysql")
const userController = Router()

//url endpoint "http://localhost:8000/users/userData"
userController.post('/addData', async(req, res)=>{
    const data = await m$user.addUser(req.body)
    response.sendResponse(data, res)
})
//url endpoint "http://localhost:8000/user/(id)1"
userController.put('/:id',middleware, async(req, res)=>{
    const data = await m$user.updateUser(req)
    response.sendResponse(data, res)
})
module.exports = userController