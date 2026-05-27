import { logger } from '../utils/logger.js'

export interface CompressOptions {
  dir: string
  quality: string
  output?: string
  backup?: boolean
  threshold: string
  dryRun?: boolean
}

export async function compressCommand(options: CompressOptions): Promise<void> {
  logger.title('🖼️  Image Compression')
  logger.info(`Compressing images at: ${options.dir}`)

  // TODO: Implement image compressor
  logger.warn('Compress command not yet implemented')
}
