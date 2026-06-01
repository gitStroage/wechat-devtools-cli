import path from 'node:path'
import { logger } from '../utils/logger.js'
import { compressImages } from '../analyzers/image.js'
import { printCompressReport } from '../reporters/console.js'
import { writeJsonReport } from '../reporters/json.js'

export interface CompressOptions {
  dir: string
  quality: string
  output?: string
  backup?: boolean
  threshold: string
  dryRun?: boolean
}

export async function compressCommand(options: CompressOptions): Promise<void> {
  const spinner = logger.spinner('Compressing images...')

  try {
    const projectDir = path.resolve(options.dir)
    const result = await compressImages(projectDir, {
      quality: parseInt(options.quality, 10),
      output: options.output,
      backup: options.backup,
      threshold: parseInt(options.threshold, 10),
      dryRun: options.dryRun,
    })

    if (options.dryRun) {
      spinner.succeed('Dry run complete')
    } else {
      spinner.succeed('Compression complete')
    }

    printCompressReport(result)
  } catch (error) {
    spinner.fail('Compression failed')
    throw error
  }
}
