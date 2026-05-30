import path from 'node:path'
import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { analyzeDependency, generateMermaidGraph } from '../analyzers/dependency.js'
import { writeJsonReport } from '../reporters/json.js'

export interface DepsOptions {
  dir: string
  type: 'component' | 'page' | 'all'
  output?: string
  format: 'text' | 'json' | 'mermaid'
  depth: string
}

export async function depsCommand(options: DepsOptions): Promise<void> {
  const spinner = logger.spinner('Analyzing dependencies...')

  try {
    const projectDir = path.resolve(options.dir)
    const result = await analyzeDependency(projectDir, {
      type: options.type,
      depth: parseInt(options.depth, 10),
    })

    spinner.succeed('Analysis complete')

    switch (options.format) {
      case 'text':
        printDependencyReport(result)
        break

      case 'json':
        if (options.output) {
          await writeJsonReport(options.output, result)
          logger.success(`Report saved to: ${options.output}`)
        } else {
          console.log(JSON.stringify(result, null, 2))
        }
        break

      case 'mermaid':
        const mermaid = generateMermaidGraph(result)
        if (options.output) {
          const fs = await import('fs-extra')
          await fs.writeFile(options.output, mermaid)
          logger.success(`Mermaid graph saved to: ${options.output}`)
        } else {
          console.log(mermaid)
        }
        break
    }
  } catch (error) {
    spinner.fail('Analysis failed')
    throw error
  }
}

function printDependencyReport(result: ReturnType<typeof analyzeDependency> extends Promise<infer R> ? R : never): void {
  console.log()
  console.log(chalk.bold('🔗 Component Dependencies'))
  console.log(chalk.gray('━'.repeat(50)))

  // 页面依赖
  if (result.pages.length > 0) {
    console.log()
    console.log(chalk.bold('📄 Page Dependencies:'))

    for (const page of result.pages) {
      console.log(chalk.blue(`├── ${page.path}`))
      for (const dep of page.components) {
        console.log(chalk.gray(`│   ├── ${dep}`))
      }
    }
  }

  // 组件依赖
  if (result.components.length > 0) {
    console.log()
    console.log(chalk.bold('🧩 Component Dependencies:'))

    for (const component of result.components) {
      console.log(chalk.green(`├── ${component.path}`))
      if (component.usedBy.length > 0) {
        console.log(chalk.gray(`│   Used by: ${component.usedBy.join(', ')}`))
      }
    }
  }

  // 统计信息
  console.log()
  console.log(chalk.bold('📊 Statistics:'))
  console.log(`  Pages: ${result.stats.pageCount}`)
  console.log(`  Components: ${result.stats.componentCount}`)

  if (result.stats.mostUsedComponent) {
    console.log(
      `  Most used: ${chalk.yellow(result.stats.mostUsedComponent.path)} (${result.stats.mostUsedComponent.count} references)`
    )
  }

  // 循环依赖
  if (result.circularDependencies.length > 0) {
    console.log()
    console.log(chalk.red('⚠️  Circular Dependencies:'))
    for (const cycle of result.circularDependencies) {
      console.log(chalk.red(`  ${cycle.join(' → ')}`))
    }
  } else {
    console.log()
    console.log(chalk.green('✓ No circular dependencies detected'))
  }
}
