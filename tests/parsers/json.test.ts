import { describe, it, expect } from 'vitest'
import { parseJson } from '../../src/parsers/json'

describe('parseJson', () => {
  it('should parse app.json with pages', () => {
    const content = JSON.stringify({
      pages: ['pages/index/index', 'pages/profile/profile'],
      window: { navigationBarTitleText: 'Test' },
    })
    const result = parseJson(content)
    expect(result).not.toBeNull()
    expect(result!.pages).toEqual(['pages/index/index', 'pages/profile/profile'])
  })

  it('should parse usingComponents', () => {
    const content = JSON.stringify({
      usingComponents: {
        'my-header': '/components/header/header',
        'my-footer': '/components/footer/footer',
      },
    })
    const result = parseJson(content)
    expect(result).not.toBeNull()
    expect(result!.components['my-header']).toBe('/components/header/header')
    expect(result!.components['my-footer']).toBe('/components/footer/footer')
  })

  it('should parse tabBar pages', () => {
    const content = JSON.stringify({
      pages: ['pages/index/index'],
      tabBar: {
        list: [
          { pagePath: 'pages/index/index', text: '首页' },
          { pagePath: 'pages/profile/profile', text: '我的' },
        ],
      },
    })
    const result = parseJson(content)
    expect(result).not.toBeNull()
    expect(result!.tabBarPages).toContain('pages/index/index')
    expect(result!.tabBarPages).toContain('pages/profile/profile')
  })

  it('should parse subPackages', () => {
    const content = JSON.stringify({
      pages: ['pages/index/index'],
      subPackages: [
        {
          root: 'packageA',
          pages: ['pages/detail/detail'],
        },
      ],
    })
    const result = parseJson(content)
    expect(result).not.toBeNull()
    expect(result!.pages).toContain('pages/index/index')
    expect(result!.pages).toContain('packageApages/detail/detail')
  })

  it('should return null for invalid JSON', () => {
    const result = parseJson('invalid json')
    expect(result).toBeNull()
  })

  it('should handle empty config', () => {
    const result = parseJson('{}')
    expect(result).not.toBeNull()
    expect(result!.pages).toEqual([])
    expect(result!.components).toEqual({})
    expect(result!.tabBarPages).toEqual([])
  })
})
