import fs from 'fs-extra'
import path from 'node:path'
import { getFileExtension, isImageFile } from './path.js'

export interface FileInfo {
  path: string
  relativePath: string
  size: number
  extension: string
}

export async function scanDirectory(
  dir: string,
  options: {
    ignore?: string[]
    extensions?: string[]
    maxDepth?: number
  } = {}
): Promise<FileInfo[]> {
  const { ignore = [], extensions, maxDepth = Infinity } = options
  const files: FileInfo[] = []

  async function walk(currentDir: string, depth: number) {
    if (depth > maxDepth) return

    const entries = await fs.readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      const relativePath = path.relative(dir, fullPath)

      // Check ignore patterns
      if (ignore.some((pattern) => relativePath.includes(pattern))) {
        continue
      }

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1)
      } else if (entry.isFile()) {
        const ext = getFileExtension(entry.name)

        if (extensions && !extensions.includes(ext)) {
          continue
        }

        const stat = await fs.stat(fullPath)
        files.push({
          path: fullPath,
          relativePath,
          size: stat.size,
          extension: ext,
        })
      }
    }
  }

  await walk(dir, 0)
  return files
}

export async function scanImages(dir: string, ignore: string[] = []): Promise<FileInfo[]> {
  const allFiles = await scanDirectory(dir, { ignore })
  return allFiles.filter((file) => isImageFile(file.path))
}

export async function readJsonFile<T = any>(filePath: string): Promise<T | null> {
  try {
    return await fs.readJson(filePath)
  } catch {
    return null
  }
}

export async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath)
}
