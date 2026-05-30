import path from 'node:path'
import { readJsonFile, readTextFile, fileExists, scanDirectory } from '../utils/file.js'
import { resolveProjectPath } from '../utils/path.js'
import { parseJson } from '../parsers/json.js'
import { parseWxml } from '../parsers/wxml.js'
import { parseJs } from '../parsers/js.js'
import type { DependencyAnalysisResult } from '../types/analysis.js'

interface DependencyNode {
  path: string
  dependencies: Set<string>
  usedBy: Set<string>
}

/**
 * 分析项目依赖关系
 */
export async function analyzeDependency(
  projectDir: string,
  options: {
    type?: 'component' | 'page' | 'all'
    depth?: number
  } = {}
): Promise<DependencyAnalysisResult> {
  const { type = 'all', depth = 5 } = options
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

  // 依赖图
  const dependencyMap = new Map<string, DependencyNode>()

  // 初始化节点
  for (const page of pages) {
    dependencyMap.set(page, { path: page, dependencies: new Set(), usedBy: new Set() })
  }

  // 分析每个页面的依赖
  for (const page of pages) {
    await analyzePageDependencies(root, page, dependencyMap, depth)
  }

  // 扫描 components 目录中的组件
  const componentsDir = resolveProjectPath(root, 'components')
  if (await fileExists(componentsDir)) {
    const componentFiles = await scanDirectory(componentsDir, {
      extensions: ['.json'],
    })

    for (const file of componentFiles) {
      const componentName = path.relative(root, file.path).replace(/\.json$/, '')
      if (!dependencyMap.has(componentName)) {
        dependencyMap.set(componentName, {
          path: componentName,
          dependencies: new Set(),
          usedBy: new Set(),
        })
      }

      // 分析组件依赖
      await analyzeComponentDependencies(root, componentName, dependencyMap, depth)
    }
  }

  // 构建结果
  const result: DependencyAnalysisResult = {
    pages: [],
    components: [],
    graph: {},
    circularDependencies: [],
    stats: {
      pageCount: pages.length,
      componentCount: 0,
      maxDepth: 0,
      mostUsedComponent: null,
    },
  }

  // 转换为结果格式
  for (const [nodePath, node] of dependencyMap) {
    const deps = Array.from(node.dependencies)
    const usedBy = Array.from(node.usedBy)

    if (pages.includes(nodePath)) {
      result.pages.push({
        path: nodePath,
        components: deps.filter((d) => !d.startsWith('pages/')),
        imports: deps,
      })
    } else {
      result.components.push({
        path: nodePath,
        usedBy,
        dependencies: deps,
      })
    }

    result.graph[nodePath] = deps
  }

  // 检测循环依赖
  result.circularDependencies = detectCircularDependencies(result.graph)

  // 计算统计信息
  result.stats.componentCount = result.components.length

  // 找出被引用最多的组件
  let maxUsed = 0
  let mostUsed: string | null = null
  for (const component of result.components) {
    if (component.usedBy.length > maxUsed) {
      maxUsed = component.usedBy.length
      mostUsed = component.path
    }
  }
  result.stats.mostUsedComponent = mostUsed ? { path: mostUsed, count: maxUsed } : null

  return result
}

/**
 * 分析页面依赖
 */
async function analyzePageDependencies(
  root: string,
  pagePath: string,
  dependencyMap: Map<string, DependencyNode>,
  maxDepth: number,
  currentDepth = 0
): Promise<void> {
  if (currentDepth >= maxDepth) return

  const node = dependencyMap.get(pagePath)
  if (!node) return

  // 读取页面的 JSON 配置
  const jsonPath = resolveProjectPath(root, `${pagePath}.json`)
  const jsonContent = await readTextFile(jsonPath)
  if (jsonContent) {
    const jsonResult = parseJson(jsonContent)
    if (jsonResult?.components) {
      for (const componentPath of Object.values(jsonResult.components)) {
        const normalizedPath = componentPath.startsWith('/')
          ? componentPath.slice(1)
          : componentPath

        node.dependencies.add(normalizedPath)

        // 确保组件节点存在
        if (!dependencyMap.has(normalizedPath)) {
          dependencyMap.set(normalizedPath, {
            path: normalizedPath,
            dependencies: new Set(),
            usedBy: new Set(),
          })
        }
        dependencyMap.get(normalizedPath)!.usedBy.add(pagePath)

        // 递归分析组件依赖
        await analyzePageDependencies(root, normalizedPath, dependencyMap, maxDepth, currentDepth + 1)
      }
    }
  }

  // 读取页面的 WXML 文件
  const wxmlPath = resolveProjectPath(root, `${pagePath}.wxml`)
  const wxmlContent = await readTextFile(wxmlPath)
  if (wxmlContent) {
    const { parseWxml } = await import('../parsers/wxml.js')
    const wxmlResult = parseWxml(wxmlContent)

    for (const component of wxmlResult.components) {
      // 组件标签名需要从 JSON 配置中查找实际路径
      // 这里简化处理
    }
  }

  // 读取页面的 JS 文件
  const jsPath = resolveProjectPath(root, `${pagePath}.js`)
  const jsContent = await readTextFile(jsPath)
  if (jsContent) {
    const { parseJs } = await import('../parsers/js.js')
    const jsResult = parseJs(jsContent)

    for (const dep of jsResult.dependencies) {
      const resolvedDep = resolveJsDependency(pagePath, dep)
      node.dependencies.add(resolvedDep)

      if (!dependencyMap.has(resolvedDep)) {
        dependencyMap.set(resolvedDep, {
          path: resolvedDep,
          dependencies: new Set(),
          usedBy: new Set(),
        })
      }
      dependencyMap.get(resolvedDep)!.usedBy.add(pagePath)
    }
  }
}

/**
 * 分析组件依赖
 */
async function analyzeComponentDependencies(
  root: string,
  componentPath: string,
  dependencyMap: Map<string, DependencyNode>,
  maxDepth: number,
  currentDepth = 0
): Promise<void> {
  if (currentDepth >= maxDepth) return

  const node = dependencyMap.get(componentPath)
  if (!node) return

  // 读取组件的 JSON 配置
  const jsonPath = resolveProjectPath(root, `${componentPath}.json`)
  const jsonContent = await readTextFile(jsonPath)
  if (jsonContent) {
    const jsonResult = parseJson(jsonContent)
    if (jsonResult?.components) {
      for (const [name, componentRef] of Object.entries(jsonResult.components)) {
        const normalizedPath = componentRef.startsWith('/')
          ? componentRef.slice(1)
          : componentRef

        node.dependencies.add(normalizedPath)

        if (!dependencyMap.has(normalizedPath)) {
          dependencyMap.set(normalizedPath, {
            path: normalizedPath,
            dependencies: new Set(),
            usedBy: new Set(),
          })
        }
        dependencyMap.get(normalizedPath)!.usedBy.add(componentPath)

        await analyzeComponentDependencies(root, normalizedPath, dependencyMap, maxDepth, currentDepth + 1)
      }
    }
  }
}

/**
 * 解析 JS 依赖路径
 */
function resolveJsDependency(currentPath: string, dep: string): string {
  const currentDir = path.dirname(currentPath)
  const resolved = path.join(currentDir, dep)
  // 移除扩展名
  return resolved.replace(/\.(js|ts)$/, '')
}

/**
 * 检测循环依赖
 */
function detectCircularDependencies(graph: Record<string, string[]>): string[][] {
  const cycles: string[][] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(node: string, path: string[]) {
    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const neighbors = graph[node] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path])
      } else if (recursionStack.has(neighbor)) {
        // 找到循环
        const cycleStart = path.indexOf(neighbor)
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart))
        }
      }
    }

    recursionStack.delete(node)
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, [])
    }
  }

  return cycles
}

/**
 * 生成 Mermaid 格式的依赖图
 */
export function generateMermaidGraph(result: DependencyAnalysisResult): string {
  const lines = ['graph TD']

  for (const [node, deps] of Object.entries(result.graph)) {
    const nodeId = node.replace(/[^a-zA-Z0-9]/g, '_')
    for (const dep of deps) {
      const depId = dep.replace(/[^a-zA-Z0-9]/g, '_')
      lines.push(`  ${nodeId}["${node}"] --> ${depId}["${dep}"]`)
    }
  }

  return lines.join('\n')
}
