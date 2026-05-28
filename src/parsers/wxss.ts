export interface WxssParseResult {
  /** 引用的其他样式文件 */
  imports: string[]
  /** 使用的图片资源 */
  images: string[]
  /** 选择器数量 */
  selectorCount: number
}

/**
 * 解析 WXSS 文件内容
 */
export function parseWxss(content: string): WxssParseResult {
  const imports: string[] = []
  const images: string[] = []

  // 提取 @import 引用
  const importRegex = /@import\s+["']([^"']+)["']/g
  let importMatch
  while ((importMatch = importRegex.exec(content)) !== null) {
    if (!imports.includes(importMatch[1])) {
      imports.push(importMatch[1])
    }
  }

  // 提取 url() 中的图片引用
  const urlRegex = /url\(["']?([^"')]+\.(png|jpg|jpeg|gif|webp|svg))["']?\)/gi
  let urlMatch
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    const url = urlMatch[1]
    if (!url.startsWith('{{') && !images.includes(url)) {
      images.push(url)
    }
  }

  // 计算选择器数量（简化计算）
  const selectorRegex = /[.#\w\[\]"'~=^$*:][^{]*\{/g
  const selectorMatches = content.match(selectorRegex) || []

  return {
    imports,
    images,
    selectorCount: selectorMatches.length,
  }
}
