import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.question.count();
  console.log(`\nTotal questions in database: ${count}`);

  if (count > 0) {
    console.log('\nFirst 3 questions:');
    const questions = await prisma.question.findMany({
      take: 3,
      select: {
        id: true,
        category: true,
        difficulty: true,
        question_text: true,
        correct_option: true,
      }
    });
    questions.forEach((q) => {
      console.log(`\n- ID: ${q.id}`);
      console.log(`  Category: ${q.category}`);
      console.log(`  Difficulty: ${q.difficulty}`);
      console.log(`  Question: ${q.question_text}`);
      console.log(`  Correct: ${q.correct_option}`);
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
