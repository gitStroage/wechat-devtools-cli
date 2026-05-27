export interface SizeAnalysisResult {
  /** 总体积 (bytes) */
  totalSize: number
  /** 文件总数 */
  totalFiles: number
  /** 按类型分组的体积 */
  sizeByType: Record<string, { size: number; count: number }>
  /** 按目录分组的体积 */
  sizeByDir: Record<string, { size: number; count: number }>
  /** 文件列表 (按体积降序) */
  files: Array<{
    path: string
    size: number
    percent: number
    type: string
  }>
  /** 图片统计 */
  images: {
    totalSize: number
    count: number
    byFormat: Record<string, { size: number; count: number }>
  }
  /** 优化建议 */
  suggestions: string[]
}

export interface DependencyAnalysisResult {
  /** 页面列表 */
  pages: Array<{
    path: string
    components: string[]
    imports: string[]
  }>
  /** 组件列表 */
  components: Array<{
    path: string
    usedBy: string[]
    dependencies: string[]
  }>
  /** 依赖图 */
  graph: Record<string, string[]>
  /** 循环依赖 */
  circularDependencies: string[][]
  /** 统计信息 */
  stats: {
    pageCount: number
    componentCount: number
    maxDepth: number
    mostUsedComponent: { path: string; count: number } | null
  }
}

export interface UnusedAnalysisResult {
  /** 未使用的文件 */
  unusedFiles: Array<{
    path: string
    size: number
    type: 'page' | 'component' | 'image' | 'js' | 'css' | 'other'
  }>
  /** 总可释放体积 */
  totalReclaimableSize: number
  /** 按类型统计 */
  byType: Record<string, { count: number; size: number }>
}

export interface CompressResult {
  /** 处理的文件数 */
  processedCount: number
  /** 原始总体积 */
  originalSize: number
  /** 压缩后总体积 */
  compressedSize: number
  /** 节省的体积 */
  savedSize: number
  /** 压缩率 */
  savedPercent: number
  /** 每个文件的压缩结果 */
  files: Array<{
    path: string
    originalSize: number
    compressedSize: number
    savedPercent: number
  }>
}
