import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const developerPassword = await bcrypt.hash('developer123', 10)
  const clientPassword = await bcrypt.hash('client123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tracker.com' },
    update: { name: 'admin' },
    create: {
      email: 'admin@tracker.com',
      name: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'om@tracker.com' },
    update: { name: 'om mehta', password: await bcrypt.hash('om123', 10) },
    create: {
      email: 'om@tracker.com',
      name: 'om mehta',
      password: await bcrypt.hash('om123', 10),
      role: 'MANAGER',
    },
  })

  const developer1 = await prisma.user.upsert({
    where: { email: 'gaurav@tracker.com' },
    update: { name: 'gaurav', password: await bcrypt.hash('gaurav123', 10) },
    create: {
      email: 'gaurav@tracker.com',
      name: 'gaurav',
      password: await bcrypt.hash('gaurav123', 10),
      role: 'DEVELOPER',
    },
  })

  const developer2 = await prisma.user.upsert({
    where: { email: 'saloni@tracker.com' },
    update: { name: 'saloni jain', password: await bcrypt.hash('saloni123', 10) },
    create: {
      email: 'saloni@tracker.com',
      name: 'saloni jain',
      password: await bcrypt.hash('saloni123', 10),
      role: 'DEVELOPER',
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@tracker.com' },
    update: { name: 'client' },
    create: {
      email: 'client@tracker.com',
      name: 'client',
      password: clientPassword,
      role: 'CLIENT',
    },
  })

  console.log('Seed users created.')

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
