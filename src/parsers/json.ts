export interface JsonParseResult {
  /** 引用的组件 */
  components: Record<string, string>
  /** 页面列表 */
  pages: string[]
  /** tabBar 页面 */
  tabBarPages: string[]
  /** 其他配置 */
  config: Record<string, any>
}

/**
 * 解析小程序 JSON 配置文件
 */
export function parseJson(content: string): JsonParseResult | null {
  try {
    const config = JSON.parse(content)

    const components: Record<string, string> = {}
    const pages: string[] = []
    const tabBarPages: string[] = []

    // 提取 usingComponents
    if (config.usingComponents) {
      Object.assign(components, config.usingComponents)
    }

    // 提取 pages (app.json)
    if (config.pages && Array.isArray(config.pages)) {
      pages.push(...config.pages)
    }

    // 提取 subPackages (app.json)
    if (config.subPackages && Array.isArray(config.subPackages)) {
      for (const sub of config.subPackages) {
        if (sub.pages && Array.isArray(sub.pages)) {
          for (const page of sub.pages) {
            const fullPath = sub.root ? `${sub.root}${page}` : page
            pages.push(fullPath)
          }
        }
      }
    }

    // 提取 tabBar 页面
    if (config.tabBar?.list && Array.isArray(config.tabBar.list)) {
      for (const item of config.tabBar.list) {
        if (item.pagePath) {
          tabBarPages.push(item.pagePath)
        }
      }
    }

    return {
      components,
      pages,
      tabBarPages,
      config,
    }
  } catch {
    return null
  }
}
