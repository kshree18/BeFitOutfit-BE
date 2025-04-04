const prisma = require('../helpers/database')
const Joi = require('joi')
class _recommendation {
    getRecommendation = async (req) => {
        try {
            if (!req.query.email && req.query.event) {
                return {
                    code: 400,
                    message: "failed - bad request"
                }
            }
            const schema = Joi.object({
                email: Joi.string().required(),
                event: Joi.string().required()
            })
            const validation = schema.validate({
                email: req.query.email,
                event: req.query.event
            })
            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => {
                    detail.message
                })
                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }
            const user = await prisma.user.findUnique({
                where: { email: req.query.email },
                select: { id: true, }
            })
            if (user === null) {
                return { code: 404, message: "No email match" }
            }
          
            const findTop = await prisma.outfit.findMany({
                where: {
                    userId: user.id,
                    event: req.query.event,
                    type: "top",
                    include: true
                },
                orderBy: {
                    percentage: 'desc'
                },
                take: 1,
                select: {
                    id: true,
                    nama: true,
                    type: true,
                    event: true,
                    include: true,
                    photo: true
                }
            })
            const findBottom = await prisma.outfit.findMany({
                where: {
                    userId: user.id,
                    event: req.query.event,
                    type: "bottom",
                    include: true
                },
                orderBy: {
                    percentage: 'desc'
                },
                take: 1,
                select: {
                    id: true,
                    nama: true,
                    type: true,
                    event: true,
                    include: true,
                    photo: true
                }
            })
            const findExtra = await prisma.outfit.findMany({
                where: {
                    userId: user.id,
                    event: req.query.event,
                    type: "extra",
                    include: true
                },
                orderBy: {
                    percentage: 'desc'
                },
                take: 3,
                select: {
                    id: true,
                    nama: true,
                    type: true,
                    event: true,
                    include: true,
                    photo: true
                }
            })
            const listTop = findTop.map((top) => ({
                id: top.id,
                name: top.nama,
                type: top.type,
                event: top.event,
                imageUrl: top.photo,
                include: top.include
            }));
            const listBottom = findBottom.map((bottom) => ({
                id: bottom.id,
                name: bottom.nama,
                type: bottom.type,
                event: bottom.event,
                imageUrl: bottom.photo,
                include: bottom.include
            }));
            const listExtra = findExtra.map((extra) => ({
                id: extra.id,
                name: extra.nama,
                type: extra.type,
                event: extra.event,
                imageUrl: extra.photo,
                include: extra.include
            }));
            return {
                code: 200,
                message: "success",
                data: {
                    top: listTop,
                    bottom: listBottom,
                    extra: listExtra,
                }
            }
        } catch (err) {
            console.error('Error recommendation module', err)
            return {
                code: 500,
                message: "Internal server error"
            }
        }
    }
}
module.exports = new _recommendation()