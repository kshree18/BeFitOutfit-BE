const Joi = require('joi')
const bcrypt = require('bcrypt')
const prisma = require('../helpers/database')
const jwt = require('jsonwebtoken')
class _auth {
    register = async (req) => {
        try {
            const schema = Joi.object({
                username: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }).options({ abortEarly: false })
            const validation = schema.validate(req)
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
            const password = bcrypt.hashSync(req.password, 15)
            const getRole = await prisma.role.findFirst({
                where: { name: "user" },
                select: {
                    id: true
                }
            })
            const validateName = await prisma.user.findUnique({
                where: { username: req.username }
            })
            if (validateName === null) {
                const validateEmail = await prisma.user.findUnique({
                    where: { email: req.email }
                })
                if (validateEmail === null) {
                    await prisma.user.create({
                        data: {
                            username: req.username,
                            email: req.email,
                            password: password,
                            AuthUsers: {
                                create: {
                                    roleId: getRole.id
                                }
                            }
                        }
                    });
                    return {
                        status: true,
                        code: 201,
                        message: "created"
                    };
                }
                if (validateEmail.email === req.email) {
                    return {
                        code: 400,
                        message: "Email has been used"
                    }
                }
            }
            if (validateName.username === req.username) {
                return {
                    code: 400,
                    message: "Username has been used"
                }
            }
        } catch (error) {
            console.error('Register error auth module Error:', error);
            return {
                status: false,
                code: 404,
                error
            }
        }
    }

    login = async (body) => {
        try {
            const schema = Joi.object({
                email: Joi.string().required(),
                password: Joi.string().required()
            }).options({ abortEarly: false })
            const validation = schema.validate(body)
            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => detail.message)
                return {
                    status: false,
                    code: 422,
                    error: errorDetails.join(', ')
                }
            }
            const getUser = await prisma.user.findUnique({
                where: { email: body.email }
            })
            if (!getUser) {
                return {
                    status: false,
                    code: 404,
                    error: 'User not found'
                }
            }
            if (!bcrypt.compareSync(body.password, getUser.password)) {
                return {
                    status: false,
                    code: 404,
                    message: "Password wrong, please fill with the correct password"
                }
            }
            // console.log (password)
            const getRole = await prisma.role.findFirst({
                where: { name: "user" },
                select: {
                    id: true
                }
            })

            const user = await prisma.authUsers.findFirst({
                where: {
                    userId: getUser.id,
                    roleId: getRole.id
                },
                select: {
                    users: {
                        select: {
                            username: true,
                            email: true
                        }
                    },
                    roles: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            const { users, roles } = user
            const data = {
                username: users.username,
                email: users.email,
                roles: roles.name
            }
            const token = jwt.sign(data, 'secret-code-token', { expiresIn: "1h" })
            // console.log(token)
            return {
                status: 200,
                message: "success",
                data: {
                    "id":getUser.id,
                    "username": data.username,
                    "email": data.email,
                    "token": token
                }
            }
        }
        catch (error) {
            console.error('login auth module Error:', error);
            return {
                status: false,
                code: 404,
                error
            }
        }
    }
}

module.exports = new _auth()