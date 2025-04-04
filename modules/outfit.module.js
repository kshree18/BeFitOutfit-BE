const prisma = require('../helpers/database')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const { removeBackground } = require('../helpers/backgroundRemover')
const path = require('path')
const fs = require('fs')

class _outfit {

    //GET OUTFIT
    getOutfit = async (req) => {
        try {
            console.log("Getting outfits for user...");
            const token = req.headers.authorization.split(' ')[1]

            // periksa token
            if (!token) {
                console.log("Token is missing");
                return {
                    status: false,
                    code: 400,
                    message: 'Bad Request - Token is missing',
                };
            }
            const decoded = jwt.verify(token, 'secret-code-token')
            console.log("Token decoded, email:", decoded.email);
            const user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: {
                    id: true,
                }
            })

            // Bad request
            if (!user) {
                console.log("User not found for email:", decoded.email);
                return {
                    status: false,
                    code: 400,
                    message: 'Bad Request - User not found',
                };
            }
            console.log("Found user with ID:", user.id);
            // Retrieve outfits for the user
            const outfits = await prisma.outfit.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    nama: true,
                    type: true,
                    event: true,
                    photo: true,
                    include: true,
                    liked: true,
                },
            })
            console.log("Raw outfits from database:", outfits);
            const listOutfits = outfits.map((outfit) => ({
                id: outfit.id,
                name: outfit.nama,
                type: outfit.type,
                event: outfit.event,
                imageUrl: outfit.photo,
                include: outfit.include,
                liked: outfit.liked
            }));
            console.log("Processed outfits:", listOutfits);
            return {
                message: 'success',
                code: 200,
                data: listOutfits,
            };
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return {
                    code: 400,
                    message: 'Bad Request - Invalid token',
                };
            }

            console.error(Error, error);
            return {
                code: 500,
                message: 'Internal Error, ' + error,
            };
        }
    };

    // ADD OUTFIT
    addOutfit = async (req, res, next) => {
        try {
            if (req.file && req.file.buffer) {
                // Remove background from the image
                const processedBuffer = await removeBackground(req.file.buffer);
                
                // Create a new file object with the processed image
                const processedFile = {
                    ...req.file,
                    buffer: processedBuffer,
                    mimetype: 'image/png' // Change mimetype to PNG since background removal outputs PNG
                };

                // Save the processed image to the uploads directory
                const filename = `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, '')}.png`;
                const filepath = path.join(__dirname, '../uploads', filename);
                fs.writeFileSync(filepath, processedBuffer);
                
                // Set the public URL for the processed image
                const imgUrl = `http://192.168.137.1:8000/uploads/${filename}`;
                
                let includeValue = req.body.include
                if (includeValue === "false") {
                    includeValue = 0
                } else if (includeValue === "true") {
                    includeValue = 1
                }
                const schema = Joi.object({
                    name: Joi.string().required(),
                    event: Joi.string().required(),
                    photo: Joi.object({
                        mimetype: Joi.string().valid('image/png', 'image/jpeg', 'image/jpg').required(),
                        buffer: Joi.binary().required()
                    }),
                    percentage: Joi.number().required(),
                    type: Joi.string().required(),
                    include: Joi.boolean().required()
                }).options({ abortEarly: false })
                const validation = schema.validate({
                    name: req.body.name,
                    event: req.body.event,
                    photo: {
                        mimetype: processedFile.mimetype,
                        buffer: processedFile.buffer
                    },
                    percentage: Number(req.body.percentage),
                    type: req.body.type,
                    include: Boolean(includeValue)
                })
                if (validation.error) {
                    const errorDetails = validation.error.details.map(detail =>
                        detail.message
                    )
                    return {
                        status: false,
                        code: 422,
                        message: errorDetails
                    }
                }
                const token = req.headers.authorization.split(' ')[1]
                const decoded = jwt.verify(token, 'secret-code-token')
                const user = await prisma.user.findUnique({
                    where: { email: decoded.email },
                    select: {
                        id: true,
                    }
                })

                await prisma.outfit.create({
                    data: {
                        userId: user.id,
                        nama: req.body.name,
                        event: req.body.event,
                        photo: imgUrl,
                        percentage: Number(req.body.percentage),
                        type: req.body.type,
                        include: Boolean(includeValue)
                    }
                })

                console.log("Outfit saved successfully with image URL:", imgUrl);

                return {
                    code: 201,
                    message: "created"
                }
            }
            else {
                return {
                    code: 400,
                    message: "failed - bad request",
                }
            }
        } catch (error) {
            console.error(Error, error)
            return {
                code: 500,
                message: "Internal Error, " + error
            }
        }
    }


    // UPDATE OUTFIT
    updateOutfit = async (req) => {
        try {
            const idOutfit = Number(req.params.id)
            let includeValue = req.body.include
            if (includeValue === "false") {
                includeValue = 0
            }
            if (includeValue === "true") {
                includeValue = 1
            }
            const schema = Joi.object({
                id: Joi.number().required(),
                name: Joi.string(),
                type: Joi.string(),
                include: Joi.boolean()
            })
            const validation = schema.validate({
                id: idOutfit,
                name: req.body.name,
                type: req.body.type,
                include: Boolean(includeValue)
            })
            if (validation.error) {
                const errorDetails = validation.error.details.map(detail =>
                    detail.message
                )
                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }
            const token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, 'secret-code-token')
            const user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: {
                    id: true,
                }
            })
            const validateIdOutfit = await prisma.outfit.findUnique({
                where: {
                    id: idOutfit,
                    userId: user.id
                }
            })
            if (validateIdOutfit === null) {
                return {
                    code: 404,
                    message: "No oufit"
                }
            }
            if (req.body.name) {
                await prisma.outfit.update({
                    where: {
                        id: idOutfit,
                        userId: user.id
                    },
                    data: {
                        nama: req.body.name
                    }
                })
            }
            if (req.body.include) {
                await prisma.outfit.update({
                    where: {
                        id: idOutfit,
                        userId: user.id
                    },
                    data: {
                        include: Boolean(includeValue)
                    }
                })
            }
            if (req.body.type) {
                await prisma.outfit.update({
                    where: {
                        id: idOutfit,
                        userId: user.id
                    },
                    data: {
                        type: req.body.type
                    }
                })
            }
            return {
                code: 200,
                message: "success"
            }
        } catch (err) {
            console.error('Error, ' + err)
            return {
                code: 500,
                message: "Internal server error outfit module"
            }
        }
    }

    // DELETE OUTFIT
    deleteOutfit = async (req) => {
        try {
            const idOutfit = Number(req.params.id);
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, 'secret-code-token');
            const user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: {
                    id: true,
                },
            });

            const validateIdOutfit = await prisma.outfit.findUnique({
                where: {
                    id: idOutfit,
                    userId: user.id,
                },
            });

            if (!validateIdOutfit) {
                return {
                    code: 404,
                    message: 'Outfit not found',
                };
            }

            // Delete the outfit
            await prisma.outfit.delete({
                where: {
                    id: idOutfit,
                },
            });

            return {
                code: 200,
                message: 'successfully deleted',
            };
        } catch (err) {
            console.error('Error, ' + err);
            return {
                code: 500,
                message: 'Internal server error outfit module',
            };
        }
    };

    // TOGGLE LIKE
    toggleLike = async (req) => {
        try {
            const idOutfit = Number(req.params.id)
            const token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, 'secret-code-token')
            const user = await prisma.user.findUnique({
                where: { email: decoded.email },
                select: {
                    id: true,
                }
            })

            const outfit = await prisma.outfit.findUnique({
                where: {
                    id: idOutfit,
                    userId: user.id
                }
            })

            if (!outfit) {
                return {
                    code: 404,
                    message: "Outfit not found"
                }
            }

            await prisma.outfit.update({
                where: {
                    id: idOutfit,
                    userId: user.id
                },
                data: {
                    liked: !outfit.liked
                }
            })

            return {
                code: 200,
                message: "success"
            }
        } catch (error) {
            console.error('Error, ' + error)
            return {
                code: 500,
                message: "Internal server error outfit module"
            }
        }
    }
}

module.exports = new _outfit();