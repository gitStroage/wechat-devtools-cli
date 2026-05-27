export interface MiniProgramProject {
  /** 项目根目录 */
  root: string
  /** 源码目录 */
  srcPath: string
  /** project.config.json 内容 */
  projectConfig: ProjectConfig | null
  /** app.json 内容 */
  appConfig: AppConfig | null
  /** 页面列表 */
  pages: string[]
  /** 组件列表 */
  components: string[]
  /** 静态资源列表 */
  assets: string[]
}

export interface ProjectConfig {
  miniprogramRoot?: string
  projectname?: string
  description?: string
  appid?: string
  setting?: Record<string, any>
}

export interface AppConfig {
  pages: string[]
  window?: Record<string, any>
  tabBar?: {
    list: Array<{
      pagePath: string
      text: string
      iconPath?: string
      selectedIconPath?: string
    }>
    color?: string
    selectedColor?: string
    backgroundColor?: string
  }
  usingComponents?: Record<string, string>
}
