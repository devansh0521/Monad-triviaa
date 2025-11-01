import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '@/generated/prisma/client';
import * as crypto from 'crypto'

const prisma = new PrismaClient()

interface CSVRow {
  category: string
  difficulty: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: string
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n').filter(line => line.trim())

  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const values = line.split(',')

    if (values.length >= 8) {
      rows.push({
        category: values[0].trim(),
        difficulty: values[1].trim(),
        question: values[2].trim(),
        option1: values[3].trim(),
        option2: values[4].trim(),
        option3: values[5].trim(),
        option4: values[6].trim(),
        correct_option: values[7].trim(),
      })
    }
  }

  return rows
}

function generateHash(question: string, options: string[]): string {
  const content = question + options.join(',')
  return crypto.createHash('md5').update(content).digest('hex')
}

async function importQuestions() {
  console.log('🚀 Starting question import...\n')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'public', 'monadtrivia_questions.csv')

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: CSV file not found at ${csvPath}`)
    process.exit(1)
  }

  console.log('📖 Reading CSV file...')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const questions = parseCSV(csvContent)

  console.log(`✓ Found ${questions.length} questions in CSV\n`)

  // First, get all existing hashes to avoid duplicates
  console.log('🔍 Checking for existing questions...')
  const existingQuestions = await prisma.question.findMany({
    select: { hash: true },
  })
  const existingHashes = new Set(existingQuestions.map(q => q.hash))
  console.log(`✓ Found ${existingHashes.size} existing questions\n`)

  // Prepare questions for batch insert
  const questionsToInsert = []
  let skipped = 0

  console.log('🔄 Processing questions...')
  for (const q of questions) {
    const options = {
      A: q.option1,
      B: q.option2,
      C: q.option3,
      D: q.option4,
    }

    const hash = generateHash(q.question, [q.option1, q.option2, q.option3, q.option4])

    if (existingHashes.has(hash)) {
      skipped++
      continue
    }

    questionsToInsert.push({
      category: q.category,
      difficulty: q.difficulty,
      question_text: q.question,
      options: options as any,
      correct_option: q.correct_option,
      hash: hash,
    })
  }

  console.log(`✓ Prepared ${questionsToInsert.length} new questions`)
  console.log(`⊘ Skipped ${skipped} duplicates\n`)

  if (questionsToInsert.length === 0) {
    console.log('✅ No new questions to import!')
    return
  }

  // Batch insert in chunks of 100
  console.log('💾 Inserting questions into database...')
  const chunkSize = 100
  let imported = 0

  for (let i = 0; i < questionsToInsert.length; i += chunkSize) {
    const chunk = questionsToInsert.slice(i, i + chunkSize)

    try {
      await prisma.question.createMany({
        data: chunk,
        skipDuplicates: true,
      })
      imported += chunk.length
      console.log(`  ✓ Imported ${imported}/${questionsToInsert.length} questions`)
    } catch (error) {
      console.error(`  ✗ Error importing chunk starting at ${i}:`, error)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Import Complete!')
  console.log('='.repeat(50))
  console.log(`✓ Imported: ${imported}`)
  console.log(`⊘ Skipped (duplicates): ${skipped}`)
  console.log(`📊 Total in database: ${existingHashes.size + imported}`)
  console.log('='.repeat(50))
}

importQuestions()
  .catch((e) => {
    console.error('\n❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
