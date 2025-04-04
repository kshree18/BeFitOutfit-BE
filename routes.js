const authController = require('./controllers/authController')
const userController = require("./controllers/userController")
const outfitController = require('./controllers/outfitController')
const recommendationController = require('./controllers/recommendationController')
// const routes = (app)=>{
//     app.use('/api', userController)
// }
const _routes=[
    ['', authController],
    ['user', userController],
    ['outfit', outfitController],
    ['recommend', recommendationController]
]
const routes= (app)=>{
    _routes.forEach((route)=>{
        const [url, controller] = route
        app.use(`/${url}`, controller)
    })
}
module.exports=routes