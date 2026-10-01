import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find alice and bob
  const usersToDelete = await prisma.user.findMany({
    where: {
      email: {
        in: ['dev1@tracker.com', 'dev2@tracker.com', 'manager@tracker.com']
      }
    }
  });

  console.log('Users to delete:', usersToDelete.map(u => u.name));

  for (const user of usersToDelete) {
    await prisma.user.delete({ where: { id: user.id } });
  }

  // Find projects that have no developers or no manager, or we can just find projects named "NextGen ERP System" that were created earlier
  // Since we ran seed twice, we have two "NextGen ERP System". 
  // We can delete the one that now has 0 developers (since dev1 and dev2 were deleted, the cascade delete removed their ProjectDeveloper records).
  const emptyProjects = await prisma.project.findMany({
    where: {
      developers: {
        none: {}
      }
    }
  });

  console.log('Empty projects to delete:', emptyProjects.map(p => p.name));

  for (const proj of emptyProjects) {
    await prisma.project.delete({ where: { id: proj.id } });
  }

  // If there are duplicate projects still, let's keep the most recently created one
  const allProjects = await prisma.project.findMany({
    where: { name: 'NextGen ERP System' },
    orderBy: { createdAt: 'desc' }
  });

  if (allProjects.length > 1) {
    // Delete all but the first (most recent)
    for (let i = 1; i < allProjects.length; i++) {
      console.log('Deleting duplicate project:', allProjects[i].id);
      await prisma.project.delete({ where: { id: allProjects[i].id } });
    }
  }

  console.log('Cleanup complete.');
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
