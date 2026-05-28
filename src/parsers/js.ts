export interface JsParseResult {
  /** import 引用 */
  imports: string[]
  /** require 引用 */
  requires: string[]
  /** 所有依赖 */
  dependencies: string[]
}

/**
 * 解析 JS 文件内容，提取 import/require 引用
 */
export function parseJs(content: string): JsParseResult {
  const imports: string[] = []
  const requires: string[] = []

  // 提取 ES6 import
  // import xxx from 'path'
  // import { xxx } from 'path'
  // import 'path'
  const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g
  let importMatch
  while ((importMatch = importRegex.exec(content)) !== null) {
    const dep = importMatch[1]
    if (!imports.includes(dep)) {
      imports.push(dep)
    }
  }

  // 提取 require
  // require('path')
  // require("path")
  const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g
  let requireMatch
  while ((requireMatch = requireRegex.exec(content)) !== null) {
    const dep = requireMatch[1]
    if (!requires.includes(dep)) {
      requires.push(dep)
    }
  }

  // 合并依赖，过滤掉 npm 包
  const allDeps = [...imports, ...requires]
  const dependencies = allDeps.filter((dep) => {
    // 只保留相对路径引用
    return dep.startsWith('./') || dep.startsWith('../') || dep.startsWith('/')
  })

  return {
    imports,
    requires,
    dependencies,
  }
}
