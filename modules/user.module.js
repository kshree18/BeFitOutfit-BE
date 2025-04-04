const Joi = require('joi');
const jwt = require('jsonwebtoken')
const prisma = require('../helpers/database')
const bcrypt = require('bcrypt');
class _user {
    updateUser = async (req) => {
        try {
            const userId = Number(req.params.id)
            const body = req.body
            const schema = Joi.object({
                username: Joi.string(),
                email: Joi.string(),
                password: Joi.string(),
            }).options({ abortEarly: false })
            const validation = schema.validate(body)
            //bad request
            if (validation.error) {
                const errorDetails = validation.error.details.map(detail => {
                    detail.message
                })

                return {
                    status: false,
                    code: 400,
                    error: errorDetails.join(', ')
                }
            }
            const getUser = await prisma.user.findUnique({where: {id: userId}})
            if (!getUser) {
                return {
                    status: false,
                    code: 404, //user not found
                    message: "User account not found"
                }
            }
            // Check if new username is already taken
            const isUsernameTaken = await prisma.user.findFirst({
                where: {
                    username: body.username,
                    id: { not: userId }, // Ensure not comparing with itself
                },
            });
            if (isUsernameTaken) {
                return {
                    status: false,
                    code: 400, // Bad Request
                    message: 'Username is already taken',
                };
            }
            const getRole = await prisma.role.findFirst({
                where: { name: "user" },
                select: {
                    id: true
                }
            })
            //data pada token
            const user = await prisma.authUsers.findFirst({
                where: {
                    userId: userId,
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
            console.log(token)


            //pengkodisian update
            const update = await prisma.user.update({
                where: { id: userId },
                data: {
                    username: body.username,
                    email: body.email
                }
            })
            return {
                status: true,
                code: 201, //created
                message: "Update success",
                data: {
                    "id":userId,
                    "username": update.username,
                    "email": update.email,
                    "token": token
                }
            }
        }

        catch (error) {
            console.error('updateUser user module Error:', error);
            return {
                status: false,
                code: 500, //bad gateway
                message:"Internal server error"
            }
        }
    }
}

module.exports = new _user()