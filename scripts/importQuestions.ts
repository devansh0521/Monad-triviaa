import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '@/generated/prisma/client'
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
  const headers = lines[0].split(',')

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
  console.log('Starting question import...\n')

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'public', 'monadtrivia_questions.csv')

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`)
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const questions = parseCSV(csvContent)

  console.log(`Found ${questions.length} questions in CSV\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const q of questions) {
    try {
      const options = {
        A: q.option1,
        B: q.option2,
        C: q.option3,
        D: q.option4,
      }

      const hash = generateHash(q.question, [q.option1, q.option2, q.option3, q.option4])

      // Check if question already exists
      const existing = await prisma.question.findFirst({
        where: { hash },
      })

      if (existing) {
        skipped++
        continue
      }

      // Create question
      await prisma.question.create({
        data: {
          category: q.category,
          difficulty: q.difficulty,
          question_text: q.question,
          options: options as any,
          correct_option: q.correct_option,
          hash: hash,
        },
      })

      imported++

      if (imported % 50 === 0) {
        console.log(`Imported ${imported} questions...`)
      }
    } catch (error) {
      console.error(`Error importing question: ${q.question}`)
      console.error(error)
      errors++
    }
  }

  console.log('\n=== Import Complete ===')
  console.log(`✓ Imported: ${imported}`)
  console.log(`⊘ Skipped (duplicates): ${skipped}`)
  console.log(`✗ Errors: ${errors}`)
  console.log(`Total processed: ${questions.length}`)
}

importQuestions()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
