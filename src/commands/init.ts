import fs from 'fs-extra'
import path from 'node:path'
import { logger } from '../utils/logger.js'
import { defaultConfig } from '../types/config.js'

export interface InitOptions {
  yes?: boolean
}

export async function initCommand(options: InitOptions): Promise<void> {
  logger.title('⚙️  Initialize WDC Configuration')

  const configPath = path.resolve(process.cwd(), '.wdcrc.json')

  // Check if config already exists
  if (await fs.pathExists(configPath)) {
    logger.warn('Configuration file already exists: .wdcrc.json')
    return
  }

  // Write default config
  await fs.writeJson(configPath, defaultConfig, { spaces: 2 })

  logger.success('Created configuration file: .wdcrc.json')
  logger.info('Edit the file to customize your settings.')
}
