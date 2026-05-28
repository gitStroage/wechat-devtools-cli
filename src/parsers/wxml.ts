export interface WxmlParseResult {
  /** 自定义组件引用 */
  components: string[]
  /** 图片引用 */
  images: string[]
  /** 事件绑定 */
  events: string[]
  /** 标签列表 */
  tags: string[]
}

/**
 * 解析 WXML 文件内容
 */
export function parseWxml(content: string): WxmlParseResult {
  const components: string[] = []
  const images: string[] = []
  const events: string[] = []
  const tags: string[] = []

  // 提取标签
  const tagRegex = /<([a-z][a-z0-9-]*)/gi
  let tagMatch
  while ((tagMatch = tagRegex.exec(content)) !== null) {
    const tag = tagMatch[1].toLowerCase()
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
  }

  // 提取自定义组件引用 (非标准 HTML 标签)
  const standardTags = [
    'view', 'text', 'image', 'scroll-view', 'swiper', 'swiper-item',
    'movable-area', 'movable-view', 'cover-view', 'cover-image',
    'icon', 'progress', 'rich-text', 'text', 'button', 'form',
    'input', 'textarea', 'picker', 'picker-view', 'slider',
    'switch', 'navigator', 'audio', 'image', 'video', 'camera',
    'live-player', 'live-pusher', 'map', 'canvas', 'open-data',
    'web-view', 'ad', 'block', 'slot', 'template', 'import',
    'include', 'wxs', 'page-meta', 'navigation-bar',
  ]

  for (const tag of tags) {
    if (!standardTags.includes(tag) && !tag.startsWith('wx-')) {
      if (!components.includes(tag)) {
        components.push(tag)
      }
    }
  }

  // 提取图片 src
  const imgSrcRegex = /<image[^>]+src=["']([^"']+)["']/gi
  let imgMatch
  while ((imgMatch = imgSrcRegex.exec(content)) !== null) {
    const src = imgMatch[1]
    if (!src.startsWith('{{') && !images.includes(src)) {
      images.push(src)
    }
  }

  // 提取其他 src 属性
  const srcRegex = /src=["']([^"']+\.(png|jpg|jpeg|gif|webp|svg))["']/gi
  let srcMatch
  while ((srcMatch = srcRegex.exec(content)) !== null) {
    const src = srcMatch[1]
    if (!src.startsWith('{{') && !images.includes(src)) {
      images.push(src)
    }
  }

  // 提取事件绑定
  const eventRegex = /(bind|catch|mut-bind|bind:|catch:|mut-bind:)(\w+)/g
  let eventMatch
  while ((eventMatch = eventRegex.exec(content)) !== null) {
    const event = eventMatch[2]
    if (!events.includes(event)) {
      events.push(event)
    }
  }

  return {
    components,
    images,
    events,
    tags,
  }
}
