const multer = require('multer')
const Multer = multer({ storage: multer.memoryStorage() })
module.exports = Multer