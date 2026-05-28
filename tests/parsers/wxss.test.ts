import { describe, it, expect } from 'vitest'
import { parseWxss } from '../../src/parsers/wxss'

describe('parseWxss', () => {
  it('should extract imports', () => {
    const content = `
      @import "/components/header/header.wxss";
      @import "../common.wxss";

      .container { padding: 20rpx; }
    `
    const result = parseWxss(content)
    expect(result.imports).toContain('/components/header/header.wxss')
    expect(result.imports).toContain('../common.wxss')
  })

  it('should extract image URLs', () => {
    const content = `
      .bg {
        background-image: url('/images/bg.png');
      }
      .icon {
        background: url("/images/icon.jpg");
      }
    `
    const result = parseWxss(content)
    expect(result.images).toContain('/images/bg.png')
    expect(result.images).toContain('/images/icon.jpg')
  })

  it('should count selectors', () => {
    const content = `
      .container { padding: 20rpx; }
      .title { font-size: 16px; }
      #main { color: red; }
    `
    const result = parseWxss(content)
    expect(result.selectorCount).toBe(3)
  })

  it('should handle empty content', () => {
    const result = parseWxss('')
    expect(result.imports).toEqual([])
    expect(result.images).toEqual([])
    expect(result.selectorCount).toBe(0)
  })
})
