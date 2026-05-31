import path from 'node:path'
import { readJsonFile, readTextFile, fileExists, scanDirectory } from '../utils/file.js'
import { resolveProjectPath, isImageFile } from '../utils/path.js'
import { parseJson } from '../parsers/json.js'
import { parseWxml } from '../parsers/wxml.js'
import { parseWxss } from '../parsers/wxss.js'
import { parseJs } from '../parsers/js.js'
import type { UnusedAnalysisResult } from '../types/analysis.js'

/**
 * 分析未使用的代码和文件
 */
export async function analyzeUnused(
  projectDir: string,
  options: {
    ignore?: string[]
  } = {}
): Promise<UnusedAnalysisResult> {
  const { ignore = ['node_modules', '.git', 'dist'] } = options
  const root = path.resolve(projectDir)

  // 读取 app.json
  const appJsonPath = resolveProjectPath(root, 'app.json')
  const appConfig = await readJsonFile(appJsonPath)

  if (!appConfig) {
    throw new Error('Cannot find app.json in project directory')
  }

  // 获取所有页面
  const pages: string[] = appConfig.pages || []
  if (appConfig.subPackages) {
    for (const sub of appConfig.subPackages) {
      if (sub.pages) {
        for (const page of sub.pages) {
          pages.push(sub.root ? `${sub.root}${page}` : page)
        }
      }
    }
  }

  // 收集所有被引用的文件
  const referencedFiles = new Set<string>()

  // 入口文件总是被引用的
  referencedFiles.add('app.js')
  referencedFiles.add('app.json')
  referencedFiles.add('app.wxss')

  // 页面文件总是被引用的（在 app.json 中注册）
  for (const page of pages) {
    referencedFiles.add(`${page}.wxml`)
    referencedFiles.add(`${page}.wxss`)
    referencedFiles.add(`${page}.js`)
    referencedFiles.add(`${page}.json`)
  }

  // 分析页面引用
  for (const page of pages) {
    await analyzeFileReferences(root, page, referencedFiles)
  }

  // 扫描所有文件
  const allFiles = await scanDirectory(root, { ignore })

  // 找出未使用的文件
  const unusedFiles: UnusedAnalysisResult['unusedFiles'] = []

  for (const file of allFiles) {
    const relativePath = path.relative(root, file.path).replace(/\\/g, '/')

    // 跳过 app 入口文件
    if (relativePath.startsWith('app.')) continue

    // 检查是否被引用
    const isReferenced = isFileReferenced(relativePath, referencedFiles)

    if (!isReferenced) {
      let type: UnusedAnalysisResult['unusedFiles'][0]['type'] = 'other'

      if (relativePath.includes('pages/')) {
        type = 'page'
      } else if (relativePath.includes('components/')) {
        type = 'component'
      } else if (isImageFile(relativePath)) {
        type = 'image'
      } else if (relativePath.endsWith('.js') || relativePath.endsWith('.ts')) {
        type = 'js'
      } else if (relativePath.endsWith('.wxss') || relativePath.endsWith('.css')) {
        type = 'css'
      }

      unusedFiles.push({
        path: relativePath,
        size: file.size,
        type,
      })
    }
  }

  // 按类型统计
  const byType: Record<string, { count: number; size: number }> = {}
  for (const file of unusedFiles) {
    if (!byType[file.type]) {
      byType[file.type] = { count: 0, size: 0 }
    }
    byType[file.type].count += 1
    byType[file.type].size += file.size
  }

  return {
    unusedFiles,
    totalReclaimableSize: unusedFiles.reduce((sum, file) => sum + file.size, 0),
    byType,
  }
}

/**
 * 分析文件引用
 */
async function analyzeFileReferences(
  root: string,
  pagePath: string,
  referencedFiles: Set<string>
): Promise<void> {
  // 分析 JSON 配置中的组件引用
  const jsonPath = resolveProjectPath(root, `${pagePath}.json`)
  const jsonContent = await readTextFile(jsonPath)
  if (jsonContent) {
    const jsonResult = parseJson(jsonContent)
    if (jsonResult?.components) {
      for (const componentPath of Object.values(jsonResult.components)) {
        const normalizedPath = componentPath.startsWith('/')
          ? componentPath.slice(1)
          : componentPath

        referencedFiles.add(`${normalizedPath}.wxml`)
        referencedFiles.add(`${normalizedPath}.wxss`)
        referencedFiles.add(`${normalizedPath}.js`)
        referencedFiles.add(`${normalizedPath}.json`)

        // 递归分析组件引用
        await analyzeComponentReferences(root, normalizedPath, referencedFiles)
      }
    }
  }

  // 分析 WXML 中的图片引用
  const wxmlPath = resolveProjectPath(root, `${pagePath}.wxml`)
  const wxmlContent = await readTextFile(wxmlPath)
  if (wxmlContent) {
    const wxmlResult = parseWxml(wxmlContent)
    for (const image of wxmlResult.images) {
      const normalizedImage = image.startsWith('/') ? image.slice(1) : image
      referencedFiles.add(normalizedImage)
    }
  }

  // 分析 WXSS 中的引用
  const wxssPath = resolveProjectPath(root, `${pagePath}.wxss`)
  const wxssContent = await readTextFile(wxssPath)
  if (wxssContent) {
    const wxssResult = parseWxss(wxssContent)
    for (const importPath of wxssResult.imports) {
      const normalizedPath = importPath.startsWith('/') ? importPath.slice(1) : importPath
      referencedFiles.add(normalizedPath)
    }
    for (const image of wxssResult.images) {
      const normalizedImage = image.startsWith('/') ? image.slice(1) : image
      referencedFiles.add(normalizedImage)
    }
  }

  // 分析 JS 中的引用
  const jsPath = resolveProjectPath(root, `${pagePath}.js`)
  const jsContent = await readTextFile(jsPath)
  if (jsContent) {
    const jsResult = parseJs(jsContent)
    for (const dep of jsResult.dependencies) {
      const resolvedDep = resolveJsDependency(pagePath, dep)
      referencedFiles.add(`${resolvedDep}.js`)
    }
  }
}

/**
 * 分析组件引用
 */
async function analyzeComponentReferences(
  root: string,
  componentPath: string,
  referencedFiles: Set<string>
): Promise<void> {
  // 分析组件的 JSON 配置
  const jsonPath = resolveProjectPath(root, `${componentPath}.json`)
  const jsonContent = await readTextFile(jsonPath)
  if (jsonContent) {
    const jsonResult = parseJson(jsonContent)
    if (jsonResult?.components) {
      for (const subComponentPath of Object.values(jsonResult.components)) {
        const normalizedPath = subComponentPath.startsWith('/')
          ? subComponentPath.slice(1)
          : subComponentPath

        referencedFiles.add(`${normalizedPath}.wxml`)
        referencedFiles.add(`${normalizedPath}.wxss`)
        referencedFiles.add(`${normalizedPath}.js`)
        referencedFiles.add(`${normalizedPath}.json`)

        // 递归分析
        await analyzeComponentReferences(root, normalizedPath, referencedFiles)
      }
    }
  }
}

/**
 * 检查文件是否被引用
 */
function isFileReferenced(filePath: string, referencedFiles: Set<string>): boolean {
  // 规范化路径分隔符
  const normalizedPath = filePath.replace(/\\/g, '/')

  // 精确匹配
  if (referencedFiles.has(normalizedPath)) return true

  // 尝试不同的扩展名
  const baseName = normalizedPath.replace(/\.\w+$/, '')
  for (const ext of ['.js', '.ts', '.wxml', '.wxss', '.json', '.png', '.jpg', '.gif']) {
    if (referencedFiles.has(`${baseName}${ext}`)) return true
  }

  // 检查是否是 tabBar 图标
  if (normalizedPath.includes('tabbar') || normalizedPath.includes('tab-bar')) {
    return true
  }

  return false
}

/**
 * 解析 JS 依赖路径
 */
function resolveJsDependency(currentPath: string, dep: string): string {
  const currentDir = path.dirname(currentPath)
  const resolved = path.join(currentDir, dep)
  return resolved.replace(/\.(js|ts)$/, '')
}
