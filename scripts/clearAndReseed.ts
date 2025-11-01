import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all questions...');

  try {
    // First, delete all answers
    const deletedAnswers = await prisma.answer.deleteMany({});
    console.log(`✅ Deleted ${deletedAnswers.count} answers`);

    // Then, delete all game rounds
    const deletedRounds = await prisma.gameRound.deleteMany({});
    console.log(`✅ Deleted ${deletedRounds.count} game rounds`);

    // Finally, delete all questions
    const deletedQuestions = await prisma.question.deleteMany({});
    console.log(`✅ Deleted ${deletedQuestions.count} questions`);

    console.log('');
    console.log('✨ Database cleared successfully!');
    console.log('');
    console.log('Now run: pnpm run prisma:seed');
    console.log('to seed the database with the corrected question format.');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
