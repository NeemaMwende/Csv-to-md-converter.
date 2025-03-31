import { describe, test, expect } from 'vitest'
import markdownGenerator from '../../../utils/markdownGenerator'

describe('markdownGenerator', () => {
  test('generates correct markdown for multiple choice question', () => {
    const question = {
      'Question Type': 'multiplechoice',
      'Parent Category': 'Basics of React',
      Category: 'Basics',
      Question: 'What is create-react-app?',
      Correct: 'D',
      'Answer A': 'A compiler for Javascript code',
      'Answer B': 'A connection between front-end and back-end code',
      'Answer C': 'An auto-complete tool for React',
      'Answer D':
        'A command-line interface to generate a project that can serve, compile, and build React apps',
    }

    const markdown = markdownGenerator.questionToMarkdown(question)

    expect(markdown).toContain('tags: basics-of-react basics')
    expect(markdown).toContain('What is create-react-app?')
    expect(markdown).toContain('# Correct')
    expect(markdown).toContain(
      'A command-line interface to generate a project that can serve, compile, and build React apps',
    )
    expect(markdown).toContain('# \n\nA compiler for Javascript code')
  })

  test('generates correct markdown for multiple response question', () => {
    const question = {
      'Question Type': 'multipleresponse',
      'Parent Category': 'Basics of React',
      Category: 'Components',
      Question: 'Which of the following are React hooks?',
      Correct: 'A,B,D',
      'Answer A': 'useState',
      'Answer B': 'useEffect',
      'Answer C': 'useAction',
      'Answer D': 'useContext',
    }

    const markdown = markdownGenerator.questionToMarkdown(question)

    expect(markdown).toContain('tags: basics-of-react components')
    expect(markdown).toContain('Which of the following are React hooks?')
    expect(markdown).toContain('# Correct\n\nuseState')
    expect(markdown).toContain('# Correct\n\nuseEffect')
    expect(markdown).toContain('# Correct\n\nuseContext')
    expect(markdown).toContain('# \n\nuseAction')
  })

  test('properly handles code blocks in questions', () => {
    const question = {
      'Question Type': 'multiplechoice',
      Question: 'What does this code do? [code]console.log("Hello")[/code]',
      Correct: 'A',
      'Answer A': 'It logs [code]Hello[/code] to the console',
    }

    const markdown = markdownGenerator.questionToMarkdown(question)

    expect(markdown).toContain('What does this code do? ```\nconsole.log("Hello")\n```')
    expect(markdown).toContain('It logs ```\nHello\n``` to the console')
  })
})
