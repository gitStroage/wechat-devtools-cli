import path from 'node:path'
import { logger } from '../utils/logger.js'
import { analyzeSize } from '../analyzers/size.js'
import { printSizeReport } from '../reporters/console.js'
import { writeJsonReport, generateSizeHtmlReport } from '../reporters/json.js'

export interface AnalyzeOptions {
  dir: string
  output?: string
  format: 'console' | 'json' | 'html'
  detail?: boolean
}

export async function analyzeCommand(options: AnalyzeOptions): Promise<void> {
  const spinner = logger.spinner('Analyzing project...')

  try {
    const projectDir = path.resolve(options.dir)
    const result = await analyzeSize(projectDir)

    spinner.succeed('Analysis complete')

    // Output report
    switch (options.format) {
      case 'console':
        printSizeReport(result, options.detail)
        break

      case 'json':
        if (options.output) {
          await writeJsonReport(options.output, result)
          logger.success(`Report saved to: ${options.output}`)
        } else {
          console.log(JSON.stringify(result, null, 2))
        }
        break

      case 'html':
        if (options.output) {
          const html = generateSizeHtmlReport(result)
          const fs = await import('fs-extra')
          await fs.writeFile(options.output, html)
          logger.success(`Report saved to: ${options.output}`)
        } else {
          logger.error('HTML format requires --output option')
        }
        break
    }
  } catch (error) {
    spinner.fail('Analysis failed')
    throw error
  }
}
