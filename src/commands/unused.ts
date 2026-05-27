import { logger } from '../utils/logger.js'

export interface UnusedOptions {
  dir: string
  output?: string
  format: 'console' | 'json' | 'html'
  delete?: boolean
  dryRun?: boolean
}

export async function unusedCommand(options: UnusedOptions): Promise<void> {
  logger.title('🔍 Unused Code Detection')
  logger.info(`Scanning project at: ${options.dir}`)

  // TODO: Implement unused code detector
  logger.warn('Unused command not yet implemented')
}
