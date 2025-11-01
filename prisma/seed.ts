import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface QuestionRow {
  id?: string;
  category: string;
  difficulty: string;
  question_text: string;
  options: string;
  correct_option: string;
  hash?: string;
  times_used?: string;
  last_used_at?: string;
  created_at?: string;
}

async function main() {
  const csvPath = 'prisma/questions.csv'; // Update path as needed
  const csvRaw = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvRaw, { columns: true, skip_empty_lines: true }) as QuestionRow[];

  for (const row of records) {
    try {
      // Parse the options JSON string from CSV
      let options;
      try {
        options = JSON.parse(row.options);
      } catch (e) {
        console.warn(`Warning: Invalid JSON in options for question: "${row.question_text}"`);
        continue;
      }

      // Convert array to object with keys A, B, C, D
      const optionsObject = {
        A: options[0],
        B: options[1],
        C: options[2],
        D: options[3],
      };

      // Find which option key (A, B, C, or D) matches the correct answer
      let correctOptionKey: string | null = null;
      if (row.correct_option === options[0]) correctOptionKey = 'A';
      else if (row.correct_option === options[1]) correctOptionKey = 'B';
      else if (row.correct_option === options[2]) correctOptionKey = 'C';
      else if (row.correct_option === options[3]) correctOptionKey = 'D';

      if (!correctOptionKey) {
        console.warn(`Warning: Could not find correct option for question: "${row.question_text}"`);
        console.warn(`Correct option from CSV: "${row.correct_option}"`);
        console.warn(`Available options: ${JSON.stringify(options)}`);
        continue; // Skip this question
      }

      await prisma.question.create({
        data: {
          category: row.category,
          difficulty: row.difficulty,
          question_text: row.question_text,
          options: optionsObject,
          correct_option: correctOptionKey, // Store as 'A', 'B', 'C', or 'D'
          hash: row.hash,
        }
      });
    } catch (error) {
      console.error(`Error processing question: "${row.question_text}"`, error);
    }
  }

  console.log(`Seeded ${records.length} questions!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });