# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-02-01

### Features

- **`wdc analyze`** - 包体积分析命令，支持 console/json/html 格式输出
- **`wdc deps`** - 依赖关系分析命令，支持 text/json/mermaid 格式输出
- **`wdc unused`** - 未使用代码检测命令，支持 --delete 和 --dry-run
- **`wdc compress`** - 图片压缩命令，支持 PNG/JPG/GIF/WebP 格式
- **`wdc init`** - 初始化配置文件命令
- **WXML 解析器** - 提取组件引用、图片引用、事件绑定
- **WXSS 解析器** - 提取样式引用、图片 URL
- **JSON 解析器** - 解析 app.json、usingComponents、tabBar
- **JS 解析器** - 提取 import/require 依赖
- **项目扫描器** - 自动识别小程序项目结构
- **控制台报告** - 彩色表格输出，优化建议
- **JSON/HTML 报告** - 支持导出分析结果
