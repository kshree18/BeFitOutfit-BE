const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const prisma = require('./database')
require('dotenv').config()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

class _storage {
    uploadToLocal = (req, res, next) => {
        try {
            if (!req.file) return "error"
            const schema = Joi.object({
                photo: Joi.object({
                    mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/jpg').required(),
                    buffer: Joi.binary().required()
                })
            }).options({ abortEarly: false })
            const validation = schema.validate({
                photo: {
                    mimetype: req.file.mimetype,
                    buffer: req.file.buffer
                }
            })
            if (validation.error) {
                const errorDetails = validation.error.details[0].message
                return res.status(400).send({ message: errorDetails })
            }

            const filename = `${Date.now()}-${req.file.originalname}`
            const filepath = path.join(uploadsDir, filename)
            
            fs.writeFileSync(filepath, req.file.buffer)
            
            req.file.localPath = filepath
            req.file.publicUrl = `http://192.168.137.1:8000/uploads/${filename}`
            next()
        } catch (error) {
            next(error)
        }
    }

    deleteFromLocal = async (req, res, next) => {
        try {
            const filepath = req.file?.localPath
            if (filepath && fs.existsSync(filepath)) {
                fs.unlinkSync(filepath)
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new _storage()