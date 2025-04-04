const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Create the user role if it doesn't exist
    const userRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'user',
        },
    })
    console.log({ userRole })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 