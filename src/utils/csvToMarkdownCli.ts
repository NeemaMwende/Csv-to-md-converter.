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
  complete: (results) => {
    if (results.errors && results.errors.length > 0) {
      console.error('CSV parsing error:', results.errors[0].message)
      process.exit(1)
    }

    console.log(`Found ${results.data.length} questions`)

    // Convert each question to markdown
    results.data.forEach((question, index) => {
      try {
        const markdown = markdownGenerator.questionToMarkdown(question)
        const filename = markdownGenerator.generateFilename(question, index)
        const outputPath = path.join(outputDir, filename)

        fs.writeFileSync(outputPath, markdown)
        console.log(`Created: ${filename}`)
      } catch (err) {
        console.error(`Error processing question ${index + 1}:`, err.message)
      }
    })

    console.log(
      `Conversion complete. ${results.data.length} markdown files created in ${outputDir}`,
    )
  },
  error: (error) => {
    console.error('Error:', error.message)
    process.exit(1)
  },
})
