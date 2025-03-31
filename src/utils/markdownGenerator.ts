export default {
  /**
   * Convert a question object to Markdown format
   * @param {Object} question - Question data from CSV
   * @returns {String} - Markdown content for the question
   */
  questionToMarkdown(question) {
    let markdown = ''
    const difficulty = 1
    const tags = []

    // Add tags based on categories
    if (question['Parent Category']) {
      tags.push(this.formatTag(question['Parent Category']))
    }
    if (question.Category) {
      tags.push(this.formatTag(question.Category))
    }

    // Create front matter
    markdown += '---\n'
    markdown += `difficulty: ${difficulty}\n`
    markdown += `tags: ${tags.join(' ')}\n`
    markdown += '---\n\n'

    // Add question text
    markdown += `${this.cleanText(question.Question)}\n\n`

    // Process different question types
    if (question['Question Type'] === 'multiplechoice') {
      markdown = this.processMultipleChoice(markdown, question)
    } else if (question['Question Type'] === 'multipleresponse') {
      markdown = this.processMultipleResponse(markdown, question)
    } else if (question['Question Type'] === 'matching') {
      markdown = this.processMatching(markdown, question)
    }

    return markdown
  },

  /**
   * Process multiple choice question type
   */
  processMultipleChoice(markdown, question) {
    // Add the correct answer first with "# Correct" marker
    const correctIndex = question.Correct.charCodeAt(0) - 65 // Convert A, B, C to 0, 1, 2

    markdown += `# Correct\n\n${this.cleanText(question[`Answer ${question.Correct}`])}\n\n`

    // Add all other answers with "# " marker
    for (let i = 0; i < 10; i++) {
      // Assuming max 10 answers (A-J)
      const letter = String.fromCharCode(65 + i)
      const answerKey = `Answer ${letter}`

      if (question[answerKey] && letter !== question.Correct) {
        markdown += `# \n\n${this.cleanText(question[answerKey])}\n\n`
      }
    }

    return markdown
  },

  /**
   * Process multiple response question type
   */
  processMultipleResponse(markdown, question) {
    const correctAnswers = question.Correct.split(',')

    // Add all correct answers first
    for (const letter of correctAnswers) {
      markdown += `# Correct\n\n${this.cleanText(question[`Answer ${letter}`])}\n\n`
    }

    // Add all other answers
    for (let i = 0; i < 10; i++) {
      // Assuming max 10 answers (A-J)
      const letter = String.fromCharCode(65 + i)
      const answerKey = `Answer ${letter}`

      if (question[answerKey] && !correctAnswers.includes(letter)) {
        markdown += `# \n\n${this.cleanText(question[answerKey])}\n\n`
      }
    }

    return markdown
  },

  /**
   * Process matching question type
   */
  processMatching(markdown, question) {
    markdown += '# Matches\n\n'

    // We need to go through pairs of clues and matches
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

    for (const letter of letters) {
      const clueKey = `${letter} Clue`
      const matchKey = `${letter} Match`

      if (question[clueKey] && question[matchKey]) {
        markdown += `${this.cleanText(question[clueKey])} -> ${this.cleanText(question[matchKey])}\n\n`
      }
    }

    return markdown
  },

  /**
   * Format text as a tag (lowercase, hyphens instead of spaces)
   */
  formatTag(text) {
    return text.toLowerCase().replace(/\s+/g, '-')
  },

  /**
   * Clean and format text, handling code blocks and special formatting
   */
  cleanText(text) {
    if (!text) return ''

    // Replace [code] and [/code] with markdown code blocks
    text = text.replace(/\[code\]([\s\S]*?)\[\/code\]/g, '```\n$1\n```')

    // Replace [b] and [/b] with markdown bold
    text = text.replace(/\[b\]([\s\S]*?)\[\/b\]/g, '**$1**')

    // Replace [cmimg] tags with proper image markdown (if needed)
    // This is just a placeholder, you'd need to handle image references properly
    text = text.replace(/\[cmimg\](.*?)\[\/cmimg\]/g, '![Image]($1)')

    return text
  },

  /**
   * Generate a filename for the question
   * @param {Object} question - Question data
   * @param {Number} index - Question index for uniqueness
   * @returns {String} - Filename for the question
   */
  generateFilename(question, index) {
    // Create a slug from the first 30 chars of the question
    const questionText = question.Question || 'unnamed-question'
    const slug = questionText
      .substring(0, 30)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    return `question-${index + 1}-${slug}.md`
  },
}
