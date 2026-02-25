import { PrismaClient, Role, Shift } from '@prisma/client'
import { resetSequences } from './reset-sequences'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 0. Define encryption salt
    const salt = await bcrypt.genSalt(10);

    // 1. Clear existing data in correct order
    await prisma.timesheet.deleteMany()
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.client.deleteMany()
    await prisma.employee.deleteMany()

    // 2. Seed Employees
    console.log('Seeding employees...')
    const employees = [
        {
            id: 1,
            firstName: "John",
            lastName: "Manager",
            email: "admin@timey.com",
            password: "password123",
            role: Role.admin,
            code: "ADM-001",
            department: "Management",
            location: "Office",
            shift: Shift.day,
            address: "123 Admin Lane",
            city: "Metropolis",
            stateRegion: "Central",
            country: "USA",
            zip: "10001",
            phone: "555-0100",
            hireDate: "2023-01-01",
            workType: "standard",
            billingType: "monthly",
            employeeRate: "5000",
            employeeCurrency: "USD",
            billingRateType: "fixed",
            billingCurrency: "USD",
            billingStart: "2023-01-01",
            billingEnd: "2025-12-31",
        },
        {
            id: 2,
            firstName: "Sarah",
            lastName: "Lead",
            email: "sarah@timey.com",
            password: "password123",
            role: Role.teamLead,
            code: "TL-001",
            department: "Engineering",
            location: "Remote",
            shift: Shift.day,
            address: "456 Lead St",
            city: "Innovate",
            stateRegion: "West",
            country: "USA",
            zip: "20002",
            phone: "555-0101",
            hireDate: "2023-02-15",
            workType: "standard",
            billingType: "hourly",
            employeeRate: "60",
            employeeCurrency: "USD",
            billingRateType: "hourly",
            billingCurrency: "USD",
            billingStart: "2023-02-15",
            billingEnd: "2025-12-31",
        },
        {
            id: 3,
            firstName: "Mike",
            lastName: "Dev",
            email: "mike@timey.com",
            password: "password123",
            role: Role.employee,
            code: "EMP-001",
            department: "Engineering",
            location: "Remote",
            shift: Shift.day,
            address: "789 Dev Rd",
            city: "Coders",
            stateRegion: "East",
            country: "USA",
            zip: "30003",
            phone: "555-0102",
            hireDate: "2023-03-20",
            workType: "standard",
            billingType: "hourly",
            employeeRate: "45",
            employeeCurrency: "USD",
            billingRateType: "hourly",
            billingCurrency: "USD",
            billingStart: "2023-03-20",
            billingEnd: "2025-12-31",
        }
    ];

    for (const emp of employees) {
        const hashedPassword = await bcrypt.hash(emp.password, salt);
        await prisma.employee.create({
            data: {
                ...emp,
                password: hashedPassword
            }
        });
    }

    // 3. Seed Clients
    console.log('Seeding clients...')
    const clients = [
        { id: 1, name: "Global Tech", nickname: "GTech", email: "contact@gtech.com", country: "USA", status: "Active" },
        { id: 2, name: "Innovative Solutions", nickname: "ISol", email: "info@innovativesol.com", country: "Canada", status: "Active" }
    ];
    for (const client of clients) {
        await prisma.client.create({ data: client as any })
    }

    // 4. Seed Projects
    console.log('Seeding projects...')
    const projects = [
        {
            id: 1,
            name: "Cloud Migration",
            code: "PRJ-CLOUD",
            clientId: 1,
            clientName: "Global Tech",
            teamLeadId: 2,
            managerId: 1,
            status: "Active",
            startDate: "2024-01-01",
            billingType: "hourly",
            defaultBillingRate: "120",
            teamMemberIds: [2, 3]
        }
    ];

    for (const proj of projects) {
        const { teamMemberIds, ...data } = proj
        await prisma.project.create({
            data: {
                ...data,
                teamMembers: {
                    connect: teamMemberIds.map(id => ({ id }))
                }
            }
        })
    }

    // 5. Seed Tasks
    console.log('Seeding tasks...')
    const tasks = [
        {
            id: 1,
            projectId: 1,
            projectName: "Cloud Migration",
            name: "Architecture Design",
            workedHours: 40,
            date: "2024-01-15",
            status: "Completed",
            billingType: "billable",
            assigneeIds: [2, 3]
        }
    ];

    for (const task of tasks) {
        const { assigneeIds, ...data } = task
        await prisma.task.create({
            data: {
                ...data,
                assignees: {
                    connect: assigneeIds.map(id => ({ id }))
                }
            }
        })
    }

    console.log('Seeding finished successfully.')

    // 6. Reset Sequences to avoid id conflicts
    await resetSequences()
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
