const { Router } = require('express')
const m$recommendation = require('../modules/recommendation.module')
const response = require('../helpers/response')
const middleware = require('../helpers/midleware')
const recommendationController = new Router()
//url endpoint "http://localhost:8000/recommend/"
recommendationController.get('', middleware, async (req, res) => {
    const data = await m$recommendation.getRecommendation(req)
    response.sendResponse(data, res)
})
module.exports = recommendationController