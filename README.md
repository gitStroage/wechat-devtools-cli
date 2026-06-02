# wechat-devtools-cli

[![npm version](https://img.shields.io/npm/v/wechat-devtools-cli.svg)](https://www.npmjs.com/package/wechat-devtools-cli)
[![npm downloads](https://img.shields.io/npm/dm/wechat-devtools-cli.svg)](https://www.npmjs.com/package/wechat-devtools-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 微信小程序开发命令行工具箱 —— 包体积分析、依赖可视化、未使用代码检测、图片压缩

English | 中文

## 特性

- **包体积分析** - 可视化展示每个文件/图片的体积占比
- **依赖关系图** - 生成组件和页面的依赖关系图
- **未使用代码检测** - 找出从未被引用的文件和代码
- **图片压缩** - 批量压缩项目中的图片资源
- **CI/CD 集成** - 支持在 CI 环境中运行
- **多格式输出** - 支持 console、JSON、HTML、Mermaid 格式

## 安装

```bash
npm install -g wechat-devtools-cli
# or
pnpm add -g wechat-devtools-cli
```

## 快速开始

```bash
# 进入小程序项目目录
cd your-mini-program

# 分析包体积
wdc analyze

# 查看依赖关系
wdc deps

# 检测未使用代码
wdc unused

# 压缩图片
wdc compress
```

## 命令详解

### `wdc analyze` - 包体积分析

分析小程序项目的包体积，找出体积最大的文件。

```bash
wdc analyze [options]

Options:
  -d, --dir <path>      项目目录 (默认: 当前目录)
  -o, --output <path>   输出报告文件路径
  -f, --format <type>   报告格式: console, json, html (默认: console)
  --detail              显示详细信息
```

**示例：**

```bash
# 控制台输出
wdc analyze

# 导出 JSON 报告
wdc analyze --format json --output report.json

# 导出 HTML 报告
wdc analyze --format html --output report.html

# 显示详细信息
wdc analyze --detail
```

### `wdc deps` - 依赖关系分析

分析组件和页面之间的依赖关系。

```bash
wdc deps [options]

Options:
  -d, --dir <path>      项目目录 (默认: 当前目录)
  -t, --type <type>     分析类型: component, page, all (默认: all)
  -o, --output <path>   输出文件路径
  -f, --format <type>   输出格式: text, json, mermaid (默认: text)
  --depth <n>           分析深度 (默认: 5)
```

**示例：**

```bash
# 文本格式输出
wdc deps

# 生成 Mermaid 图表
wdc deps --format mermaid --output deps.mmd

# 导出 JSON
wdc deps --format json --output deps.json
```

### `wdc unused` - 未使用代码检测

检测项目中从未被引用的文件和代码。

```bash
wdc unused [options]

Options:
  -d, --dir <path>      项目目录 (默认: 当前目录)
  -o, --output <path>   输出报告文件路径
  -f, --format <type>   报告格式: console, json, html (默认: console)
  --delete              自动删除未使用的文件
  --dry-run             预览将要删除的文件
```

**示例：**

```bash
# 检测未使用文件
wdc unused

# 预览将要删除的文件
wdc unused --dry-run

# 自动删除未使用文件
wdc unused --delete
```

### `wdc compress` - 图片压缩

批量压缩项目中的图片资源。

```bash
wdc compress [options]

Options:
  -d, --dir <path>      项目目录 (默认: 当前目录)
  -q, --quality <n>     压缩质量 1-100 (默认: 80)
  -o, --output <path>   输出目录 (默认: 覆盖原文件)
  --backup              压缩前备份原文件
  --threshold <size>    只压缩大于此大小的文件 (默认: 10240)
  --dry-run             预览压缩结果
```

**示例：**

```bash
# 压缩图片
wdc compress

# 设置压缩质量
wdc compress --quality 60

# 预览压缩结果
wdc compress --dry-run

# 压缩前备份
wdc compress --backup
```

### `wdc init` - 初始化配置

在项目中创建 wdc 配置文件。

```bash
wdc init [options]

Options:
  -y, --yes             使用默认配置
```

## 配置

在项目根目录创建 `.wdcrc.json` 配置文件：

```json
{
  "projectPath": ".",
  "srcPath": "miniprogram",
  "ignore": ["node_modules", ".git", "dist"],
  "analyze": {
    "maxBundleSize": 2048,
    "warnOnLargeFile": 100
  },
  "compress": {
    "quality": 80,
    "backup": true
  }
}
```

## CI/CD 集成

在 GitHub Actions 中使用：

```yaml
- name: Analyze Mini Program Bundle
  run: |
    npx wechat-devtools-cli analyze --format json --output report.json
    npx wechat-devtools-cli unused --format json --output unused.json

- name: Check Bundle Size
  run: |
    npx wechat-devtools-cli analyze --detail
```

## 与其他工具对比

| 特性 | wechat-devtools-cli | 微信开发者工具 | 其他 CLI |
|------|---------------------|---------------|----------|
| 包体积分析 | ✅ 详细 | ✅ 基础 | ❌ |
| 依赖可视化 | ✅ | ❌ | ❌ |
| 未使用代码 | ✅ | ❌ | ❌ |
| 图片压缩 | ✅ | ❌ | 部分 |
| CI 集成 | ✅ | ❌ | ❌ |
| 自定义报告 | ✅ | ❌ | ❌ |

## 贡献

欢迎贡献！请阅读 [贡献指南](./CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
