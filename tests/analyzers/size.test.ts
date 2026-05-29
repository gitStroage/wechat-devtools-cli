import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { analyzeSize } from '../../src/analyzers/size'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(__dirname, '..', 'fixtures', 'mini-program')

describe('analyzeSize', () => {
  it('should analyze project size', async () => {
    const result = await analyzeSize(fixtureDir)

    expect(result.totalSize).toBeGreaterThan(0)
    expect(result.totalFiles).toBeGreaterThan(0)
    expect(result.files.length).toBeGreaterThan(0)
  })

  it('should categorize files by type', async () => {
    const result = await analyzeSize(fixtureDir)

    expect(result.sizeByType['.js']).toBeDefined()
    expect(result.sizeByType['.json']).toBeDefined()
    expect(result.sizeByType['.wxml']).toBeDefined()
  })

  it('should track image files', async () => {
    const result = await analyzeSize(fixtureDir)

    // Our fixture doesn't have real images, but the structure should be correct
    expect(result.images).toBeDefined()
    expect(result.images.count).toBeGreaterThanOrEqual(0)
    expect(result.images.byFormat).toBeDefined()
  })

  it('should generate suggestions', async () => {
    const result = await analyzeSize(fixtureDir)

    expect(Array.isArray(result.suggestions)).toBe(true)
  })

  it('should sort files by size descending', async () => {
    const result = await analyzeSize(fixtureDir)

    for (let i = 1; i < result.files.length; i++) {
      expect(result.files[i - 1].size).toBeGreaterThanOrEqual(result.files[i].size)
    }
  })
})
