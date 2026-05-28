import { describe, it, expect } from 'vitest'
import { parseWxml } from '../../src/parsers/wxml'

describe('parseWxml', () => {
  it('should extract custom components', () => {
    const content = `
      <view>
        <my-header title="test" />
        <my-footer />
      </view>
    `
    const result = parseWxml(content)
    expect(result.components).toContain('my-header')
    expect(result.components).toContain('my-footer')
  })

  it('should extract image sources', () => {
    const content = `
      <view>
        <image src="/images/logo.png" />
        <image src="/images/banner.jpg" mode="aspectFill" />
      </view>
    `
    const result = parseWxml(content)
    expect(result.images).toContain('/images/logo.png')
    expect(result.images).toContain('/images/banner.jpg')
  })

  it('should extract event bindings', () => {
    const content = `
      <view>
        <button bindtap="onTap">Click</button>
        <view catchtouchmove="onMove">Move</view>
        <input bindinput="onInput" />
      </view>
    `
    const result = parseWxml(content)
    expect(result.events).toContain('tap')
    expect(result.events).toContain('touchmove')
    expect(result.events).toContain('input')
  })

  it('should extract tags', () => {
    const content = `
      <view class="container">
        <text>Hello</text>
        <image src="/images/test.png" />
      </view>
    `
    const result = parseWxml(content)
    expect(result.tags).toContain('view')
    expect(result.tags).toContain('text')
    expect(result.tags).toContain('image')
  })

  it('should ignore dynamic image sources', () => {
    const content = `
      <image src="{{imageUrl}}" />
      <image src="/images/static.png" />
    `
    const result = parseWxml(content)
    expect(result.images).not.toContain('{{imageUrl}}')
    expect(result.images).toContain('/images/static.png')
  })

  it('should not duplicate entries', () => {
    const content = `
      <my-component />
      <my-component />
      <image src="/images/logo.png" />
      <image src="/images/logo.png" />
    `
    const result = parseWxml(content)
    expect(result.components.filter((c) => c === 'my-component')).toHaveLength(1)
    expect(result.images.filter((i) => i === '/images/logo.png')).toHaveLength(1)
  })
})
