import path from 'node:path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { analyzeUnused } from '../analyzers/unused-code.js'
import { printUnusedReport } from '../reporters/console.js'
import { writeJsonReport } from '../reporters/json.js'

export interface UnusedOptions {
  dir: string
  output?: string
  format: 'console' | 'json' | 'html'
  delete?: boolean
  dryRun?: boolean
}

export async function unusedCommand(options: UnusedOptions): Promise<void> {
  const spinner = logger.spinner('Scanning for unused code...')

  try {
    const projectDir = path.resolve(options.dir)
    const result = await analyzeUnused(projectDir)

    spinner.succeed('Scan complete')

    // Output report
    switch (options.format) {
      case 'console':
        printUnusedReport(result)

        // Handle delete/dryRun
        if (result.unusedFiles.length > 0) {
          if (options.dryRun) {
            console.log()
            console.log(chalk.bold('🔍 Dry Run - Files to be deleted:'))
            for (const file of result.unusedFiles) {
              console.log(chalk.yellow('  -'), file.path)
            }
          } else if (options.delete) {
            console.log()
            const confirm = await confirmDeletion(result.unusedFiles.length)
            if (confirm) {
              let deletedCount = 0
              for (const file of result.unusedFiles) {
                const filePath = path.join(projectDir, file.path)
                try {
                  await fs.remove(filePath)
                  deletedCount++
                } catch {
                  logger.warn(`Failed to delete: ${file.path}`)
                }
              }
              logger.success(`Deleted ${deletedCount} files`)
            } else {
              logger.info('Deletion cancelled')
            }
          }
        }
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
        logger.warn('HTML format not yet implemented for unused report')
        break
    }
  } catch (error) {
    spinner.fail('Scan failed')
    throw error
  }
}

async function confirmDeletion(count: number): Promise<boolean> {
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(`\nDelete ${count} unused files? (y/N): `),
      (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'y')
      }
    )
  })
}
