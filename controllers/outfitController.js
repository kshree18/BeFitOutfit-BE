const { Router } = require('express')
const Multer = require('../helpers/upload-files')
const m$storage = require('../helpers/storage')
const m$outfit = require('../modules/outfit.module')
const middleware = require('../helpers/midleware')
const response = require('../helpers/response')
const outfitController = new Router()
//url endpoint "http://localhost:8000/outfit/add"
outfitController.post('/add', middleware, Multer.single('photo'), m$storage.uploadToLocal, async (req, res) => {
    // console.log(req.file)
    const data = await m$outfit.addOutfit(req)
    response.sendResponse(data, res)
})

//url endpoint "http://localhost:8000/outfit"
outfitController.get('', middleware, async(req, res)=>{
    // console.log(req.file)
    const data = await m$outfit.getOutfit(req)
    response.sendResponse(data, res)
})

//url endpoint "http://localhost:8000/outfit/:id"
outfitController.put('/:id', middleware, Multer.none(), async (req, res) => {
    const data = await m$outfit.updateOutfit(req);
    console.log(data)
    response.sendResponse(data, res)
})

// url endpoint "http://localhost:8000/outfit/:id"
outfitController.delete('/:id', middleware, m$storage.deleteFromLocal, async (req, res) => {
    const data = await m$outfit.deleteOutfit(req);
    response.sendResponse(data, res);
});

//url endpoint "http://localhost:8000/outfit/:id/like"
outfitController.post('/:id/like', middleware, async (req, res) => {
    const data = await m$outfit.toggleLike(req);
    response.sendResponse(data, res);
});

module.exports = outfitController