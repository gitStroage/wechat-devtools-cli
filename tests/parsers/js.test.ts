import { describe, it, expect } from 'vitest'
import { parseJs } from '../../src/parsers/js'

describe('parseJs', () => {
  it('should extract ES6 imports', () => {
    const content = `
      import { formatDate } from './utils/date'
      import config from '../config'
      import 'some-package'
    `
    const result = parseJs(content)
    expect(result.imports).toContain('./utils/date')
    expect(result.imports).toContain('../config')
    expect(result.imports).toContain('some-package')
  })

  it('should extract require calls', () => {
    const content = `
      const utils = require('./utils')
      const config = require('../config')
    `
    const result = parseJs(content)
    expect(result.requires).toContain('./utils')
    expect(result.requires).toContain('../config')
  })

  it('should only include relative path dependencies', () => {
    const content = `
      import { formatDate } from './utils/date'
      import Vue from 'vue'
      const config = require('../config')
      const axios = require('axios')
    `
    const result = parseJs(content)
    expect(result.dependencies).toContain('./utils/date')
    expect(result.dependencies).toContain('../config')
    expect(result.dependencies).not.toContain('vue')
    expect(result.dependencies).not.toContain('axios')
  })

  it('should handle empty content', () => {
    const result = parseJs('')
    expect(result.imports).toEqual([])
    expect(result.requires).toEqual([])
    expect(result.dependencies).toEqual([])
  })

  it('should not duplicate dependencies', () => {
    const content = `
      import { a } from './utils'
      import { b } from './utils'
    `
    const result = parseJs(content)
    expect(result.imports.filter((i) => i === './utils')).toHaveLength(1)
  })
})
