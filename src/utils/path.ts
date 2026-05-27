import path from 'node:path'

export function resolveProjectPath(dir: string, ...segments: string[]): string {
  return path.resolve(dir, ...segments)
}

export function getRelativePath(base: string, filePath: string): string {
  const relative = path.relative(base, filePath)
  return relative.startsWith('.') ? relative : `/${relative}`
}

export function getFileExtension(filePath: string): string {
  return path.ext(filePath).toLowerCase()
}

export function getFileNameWithoutExt(filePath: string): string {
  return path.basename(filePath, path.ext(filePath))
}

export function isImageFile(filePath: string): boolean {
  const ext = getFileExtension(filePath)
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'].includes(ext)
}

export function isWxmlFile(filePath: string): boolean {
  return getFileExtension(filePath) === '.wxml'
}

export function isWxssFile(filePath: string): boolean {
  return getFileExtension(filePath) === '.wxss'
}

export function isJsFile(filePath: string): boolean {
  const ext = getFileExtension(filePath)
  return ['.js', '.ts'].includes(ext)
}

export function isJsonFile(filePath: string): boolean {
  return getFileExtension(filePath) === '.json'
}
