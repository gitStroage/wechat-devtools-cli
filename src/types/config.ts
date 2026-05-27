export interface WdcConfig {
  /** 项目路径 */
  projectPath?: string
  /** 源码路径 */
  srcPath?: string
  /** 忽略的文件/目录 */
  ignore?: string[]
  /** 分析配置 */
  analyze?: {
    /** 最大包体积警告阈值 (KB) */
    maxBundleSize?: number
    /** 大文件警告阈值 (KB) */
    warnOnLargeFile?: number
  }
  /** 压缩配置 */
  compress?: {
    /** 压缩质量 1-100 */
    quality?: number
    /** 是否备份原文件 */
    backup?: boolean
  }
}

export const defaultConfig: WdcConfig = {
  projectPath: '.',
  srcPath: 'miniprogram',
  ignore: ['node_modules', '.git', 'dist'],
  analyze: {
    maxBundleSize: 2048,
    warnOnLargeFile: 100,
  },
  compress: {
    quality: 80,
    backup: true,
  },
}
