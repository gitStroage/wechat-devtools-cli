# wechat-devtools-cli

[![npm version](https://img.shields.io/npm/v/wechat-devtools-cli.svg)](https://www.npmjs.com/package/wechat-devtools-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 微信小程序开发命令行工具箱 —— 包体积分析、依赖可视化、未使用代码检测、图片压缩

English | 中文

## 特性

- **包体积分析** - 可视化展示每个文件/图片的体积占比
- **依赖关系图** - 生成组件和页面的依赖关系图
- **未使用代码检测** - 找出从未被引用的文件和代码
- **图片压缩** - 批量压缩项目中的图片资源
- **CI/CD 集成** - 支持在 CI 环境中运行

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

## 命令

### `wdc analyze` - 包体积分析

```bash
wdc analyze [options]

Options:
  -d, --dir <path>      项目目录 (默认: 当前目录)
  -o, --output <path>   输出报告文件路径
  -f, --format <type>   报告格式: console, json, html
  --detail              显示详细信息
```

### `wdc deps` - 依赖关系分析

```bash
wdc deps [options]

Options:
  -d, --dir <path>      项目目录
  -t, --type <type>     分析类型: component, page, all
  -f, --format <type>   输出格式: text, json, mermaid
  --depth <n>           分析深度
```

### `wdc unused` - 未使用代码检测

```bash
wdc unused [options]

Options:
  -d, --dir <path>      项目目录
  --delete              自动删除未使用的文件
  --dry-run             预览将要删除的文件
```

### `wdc compress` - 图片压缩

```bash
wdc compress [options]

Options:
  -d, --dir <path>      项目目录
  -q, --quality <n>     压缩质量 1-100
  --backup              压缩前备份原文件
  --threshold <size>    只压缩大于此大小的文件
  --dry-run             预览压缩结果
```

### `wdc init` - 初始化配置

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
  "ignore": ["node_modules", ".git"],
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

## License

[MIT](./LICENSE)
