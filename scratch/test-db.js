import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Testing database connection from workspace scratch...");
  try {
    const usersCount = await prisma.user.count();
    console.log("Users count in DB:", usersCount);
    
    const docsCount = await prisma.document.count();
    console.log("Documents count in DB:", docsCount);
    
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users list:", users);
  } catch (e) {
    console.error("Database connection or query failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
