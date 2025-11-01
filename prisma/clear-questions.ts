import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all questions from database...');
  const deleted = await prisma.question.deleteMany({});
  console.log(`Deleted ${deleted.count} questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
