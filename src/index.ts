import { Command } from 'commander'
import { readJsonFile } from './utils/file.js'
import { logger } from './utils/logger.js'

const program = new Command()

program
  .name('wdc')
  .description('CLI toolbox for WeChat Mini Program development')
  .version('0.1.0')

// Analyze command
program
  .command('analyze')
  .description('Analyze mini program bundle size')
  .option('-d, --dir <path>', 'Project directory', '.')
  .option('-o, --output <path>', 'Output report file path')
  .option('-f, --format <type>', 'Report format: console, json, html', 'console')
  .option('--detail', 'Show detailed information')
  .action(async (options) => {
    try {
      const { analyzeCommand } = await import('./commands/analyze.js')
      await analyzeCommand(options)
    } catch (error) {
      logger.error(`Analyze failed: ${error}`)
      process.exit(1)
    }
  })

// Dependencies command
program
  .command('deps')
  .description('Analyze component dependencies')
  .option('-d, --dir <path>', 'Project directory', '.')
  .option('-t, --type <type>', 'Analysis type: component, page, all', 'all')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <type>', 'Output format: text, json, mermaid', 'text')
  .option('--depth <n>', 'Analysis depth', '5')
  .action(async (options) => {
    try {
      const { depsCommand } = await import('./commands/deps.js')
      await depsCommand(options)
    } catch (error) {
      logger.error(`Deps analysis failed: ${error}`)
      process.exit(1)
    }
  })

// Unused code command
program
  .command('unused')
  .description('Detect unused code and files')
  .option('-d, --dir <path>', 'Project directory', '.')
  .option('-o, --output <path>', 'Output report file path')
  .option('-f, --format <type>', 'Report format: console, json, html', 'console')
  .option('--delete', 'Automatically delete unused files')
  .option('--dry-run', 'Preview files to be deleted')
  .action(async (options) => {
    try {
      const { unusedCommand } = await import('./commands/unused.js')
      await unusedCommand(options)
    } catch (error) {
      logger.error(`Unused detection failed: ${error}`)
      process.exit(1)
    }
  })

// Compress command
program
  .command('compress')
  .description('Compress images in the project')
  .option('-d, --dir <path>', 'Project directory', '.')
  .option('-q, --quality <n>', 'Compression quality 1-100', '80')
  .option('-o, --output <path>', 'Output directory (default: overwrite)')
  .option('--backup', 'Backup original files before compression')
  .option('--threshold <size>', 'Only compress files larger than this size', '10240')
  .option('--dry-run', 'Preview compression results')
  .action(async (options) => {
    try {
      const { compressCommand } = await import('./commands/compress.js')
      await compressCommand(options)
    } catch (error) {
      logger.error(`Compression failed: ${error}`)
      process.exit(1)
    }
  })

// Init command
program
  .command('init')
  .description('Initialize wdc configuration file')
  .option('-y, --yes', 'Use default configuration')
  .action(async (options) => {
    try {
      const { initCommand } = await import('./commands/init.js')
      await initCommand(options)
    } catch (error) {
      logger.error(`Init failed: ${error}`)
      process.exit(1)
    }
  })

program.parse()
