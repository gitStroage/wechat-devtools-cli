import path from 'node:path'
import { type MiniProgramProject } from '../types/project.js'
import { readJsonFile, scanDirectory, fileExists } from '../utils/file.js'
import { resolveProjectPath } from '../utils/path.js'
import { parseJson } from '../parsers/json.js'
import type { AppConfig, ProjectConfig } from '../types/project.js'

/**
 * 扫描并解析小程序项目
 */
export async function scanProject(projectDir: string): Promise<MiniProgramProject> {
  const root = path.resolve(projectDir)

  // 读取 project.config.json
  const projectConfigPath = resolveProjectPath(root, 'project.config.json')
  const projectConfig = await readJsonFile<ProjectConfig>(projectConfigPath)

  // 确定源码目录
  let srcPath = root
  if (projectConfig?.miniprogramRoot) {
    srcPath = resolveProjectPath(root, projectConfig.miniprogramRoot)
  }

  // 读取 app.json
  const appJsonPath = resolveProjectPath(srcPath, 'app.json')
  const appConfig = await readJsonFile<AppConfig>(appJsonPath)

  // 获取页面列表
  const pages: string[] = appConfig?.pages || []

  // 获取子包页面
  if (appConfig?.subPackages) {
    for (const sub of appConfig.subPackages) {
      if (sub.pages) {
        for (const page of sub.pages) {
          pages.push(sub.root ? `${sub.root}${page}` : page)
        }
      }
    }
  }

  // 扫描组件目录
  const components = await scanComponents(srcPath, appConfig)

  // 扫描静态资源
  const assets = await scanAssets(srcPath)

  return {
    root,
    srcPath,
    projectConfig,
    appConfig,
    pages,
    components,
    assets,
  }
}

/**
 * 扫描组件
 */
async function scanComponents(srcPath: string, appConfig: AppConfig | null): Promise<string[]> {
  const components: string[] = []

  // 从 app.json 的 usingComponents 中获取全局组件
  if (appConfig?.usingComponents) {
    for (const componentPath of Object.values(appConfig.usingComponents)) {
      if (componentPath.startsWith('/')) {
        components.push(componentPath.slice(1))
      } else {
        components.push(componentPath)
      }
    }
  }

  // 扫描 components 目录
  const componentsDir = resolveProjectPath(srcPath, 'components')
  if (await fileExists(componentsDir)) {
    const files = await scanDirectory(componentsDir, {
      extensions: ['.wxml'],
    })
    for (const file of files) {
      const relativePath = path.relative(srcPath, file.path)
      const componentPath = relativePath.replace(/\.wxml$/, '')
      if (!components.includes(componentPath)) {
        components.push(componentPath)
      }
    }
  }

  return components
}

/**
 * 扫描静态资源
 */
async function scanAssets(srcPath: string): Promise<string[]> {
  const assets: string[] = []

  // 扫描常见的资源目录
  const assetDirs = ['images', 'assets', 'static', 'img']

  for (const dir of assetDirs) {
    const dirPath = resolveProjectPath(srcPath, dir)
    if (await fileExists(dirPath)) {
      const files = await scanDirectory(dirPath, {
        extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'],
      })
      for (const file of files) {
        const relativePath = path.relative(srcPath, file.path)
        assets.push(relativePath)
      }
    }
  }

  return assets
}

/**
 * 获取页面文件路径（wxml, wxss, js, json）
 */
export function getPageFiles(srcPath: string, pagePath: string): string[] {
  const basePath = resolveProjectPath(srcPath, pagePath)
  return [
    `${basePath}.wxml`,
    `${basePath}.wxss`,
    `${basePath}.js`,
    `${basePath}.json`,
  ]
}
