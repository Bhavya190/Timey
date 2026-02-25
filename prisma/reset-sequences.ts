import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetSequences() {
    console.log('Resetting PostgreSQL sequences...')

    const tables = ['Employee', 'Client', 'Project', 'Task']

    for (const table of tables) {
        try {
            // PostgreSQL specific sequence reset
            const sequenceName = await prisma.$queryRawUnsafe<any[]>(
                `SELECT pg_get_serial_sequence('"${table}"', 'id') as name`
            )

            if (sequenceName[0]?.name) {
                await prisma.$executeRawUnsafe(
                    `SELECT setval('${sequenceName[0].name}', coalesce(max(id), 1), max(id) IS NOT null) FROM "${table}"`
                )
                console.log(`Successfully reset sequence for table: ${table}`)
            } else {
                console.warn(`Could not find sequence for table: ${table}`)
            }
        } catch (error) {
            console.error(`Error resetting sequence for table ${table}:`, error)
        }
    }

    console.log('Sequence reset complete.')
}

if (require.main === module) {
    resetSequences()
        .catch((e) => {
            console.error(e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}

export { resetSequences }
