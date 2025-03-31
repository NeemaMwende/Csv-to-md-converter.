#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
const markdownGenerator = require('./markdownGenerator').default

// Check if filename is provided
if (process.argv.length < 3) {
  console.error('Error: Please provide a CSV file path')
  console.log('Usage: node csvToMarkdownCli.js <csv-file-path> [output-directory]')
  process.exit(1)
}

// Get input and output paths
const csvFilePath = process.argv[2]
const outputDir = process.argv[3] || './output'

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Read and parse the CSV file
console.log(`Processing ${csvFilePath}...`)
const csvData = fs.readFileSync(csvFilePath, 'utf8')

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  // Don't enforce a strict column count
  delimiter: ',',
  quoteChar: '"',
  escapeChar: '"',
  comments: false,
  fastMode: false,
  // Important settings to handle varying field counts
  transform: (value) => value.trim(),
  transformHeader: (header) => header.trim(),
  complete: (results) => {
    // Filter out field count errors
    const criticalErrors = results.errors?.filter(
      (err) => !err.message.includes('Too few fields') && !err.message.includes('Too many fields'),
    )

    if (criticalErrors && criticalErrors.length > 0) {
      console.error('CSV parsing error:', criticalErrors[0].message)
      process.exit(1)
    }

    console.log(`Found ${results.data.length} questions`)

    // Convert each question to markdown
    results.data.forEach((question, index) => {
      try {
        // Skip empty rows
        if (
          Object.keys(question).length === 0 ||
          (question['Question Type'] === undefined && question.Question === undefined)
        ) {
          console.log(`Skipping empty row at index ${index}`)
          return
        }

        const markdown = markdownGenerator.questionToMarkdown(question)
        const filename = markdownGenerator.generateFilename(question, index)
        const outputPath = path.join(outputDir, filename)

        fs.writeFileSync(outputPath, markdown)
        console.log(`Created: ${filename}`)
      } catch (err) {
        console.error(`Error processing question ${index + 1}:`, err.message)
      }
    })

    // Count actual files created
    const fileCount = fs.readdirSync(outputDir).length
    console.log(`Conversion complete. ${fileCount} markdown files created in ${outputDir}`)
  },
  error: (error) => {
    console.error('Error:', error.message)
    process.exit(1)
  },
})
