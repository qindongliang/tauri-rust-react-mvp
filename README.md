# 🔧 环境变量管理器

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/qindongliang/tauri-rust-react-mvp?style=social)](https://github.com/qindongliang/tauri-rust-react-mvp)
[![GitHub forks](https://img.shields.io/github/forks/qindongliang/tauri-rust-react-mvp?style=social)](https://github.com/qindongliang/tauri-rust-react-mvp/fork)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.2-orange.svg)](https://www.rust-lang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux-lightgrey.svg)]()

一个基于 **Tauri + React + Rust** 的跨平台环境变量管理工具，帮助开发者轻松管理用户级环境变量。

[特性](#特性) • [快速开始](#快速开始) • [使用说明](#使用说明) • [截图](#截图) • [开发](#开发)

</div>

## 📋 目录

- [特性](#特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
  - [环境准备](#环境准备)
  - [安装运行](#安装运行)
- [使用说明](#使用说明)
  - [查看环境变量](#查看环境变量)
  - [添加环境变量](#添加环境变量)
  - [编辑环境变量](#编辑环境变量)
  - [删除环境变量](#删除环境变量)
  - [搜索过滤](#搜索过滤)
  - [主题切换](#主题切换)
- [项目结构](#项目结构)
- [开发](#开发)
  - [开发模式](#开发模式)
  - [构建应用](#构建应用)
- [故障排除](#故障排除)
- [贡献](#贡献)
- [许可](#许可)

## ✨ 特性

### 🎯 核心功能
- ✅ **查看环境变量** - 以表格形式展示所有用户级环境变量
- ➕ **添加环境变量** - 创建新的环境变量，支持实时验证
- ✏️ **编辑环境变量** - 内联编辑，快速修改变量值
- 🗑️ **删除环境变量** - 安全删除，确认机制防止误操作
- 🔍 **搜索过滤** - 按变量名或值快速搜索
- 🎨 **主题切换** - 支持亮色/暗色主题切换

### 🛡️ 验证机制
- ✅ **变量名格式验证** - 确保符合环境变量命名规范
- 📁 **路径有效性检查** - 自动检测路径类型变量是否存在
- 🔄 **实时验证** - 输入时即时反馈验证结果
- ⚠️ **状态指示** - 清晰显示变量有效性状态

### 🎨 用户体验
- 🌗 **明暗主题** - 护眼的暗色模式和清爽的亮色模式
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 💾 **自动保存** - 修改立即持久化到 shell 配置文件
- 📋 **一键复制** - 快速复制变量值到剪贴板
- 🔄 **实时刷新** - 查看最新的环境变量状态

## 🏗️ 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust + Tauri Framework
- **样式**: CSS3 (支持明暗主题)
- **通信**: Tauri API (invoke/命令调用)
- **平台**: macOS、Linux
- **存储**: Shell 配置文件 (~/.bashrc, ~/.zshrc)

## 🚀 快速开始

### 环境准备

确保已安装以下工具：

- [Node.js](https://nodejs.org/) ≥ 18.0.0
- [Rust](https://rustup.rs/) ≥ 1.70.0
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites) (可选)

### 安装运行

1. **安装依赖**
```bash
npm install
```

2. **启动开发模式**
```bash
npm run tauri dev
```

这将同时启动：
- Vite 开发服务器 (http://localhost:1420)
- Tauri 桌面应用

3. **构建生产版本**
```bash
npm run tauri build
```

## 📖 使用说明

### 查看环境变量

应用启动后，会自动加载并显示所有用户级环境变量：
- 📊 表格形式展示
- 🏷️ 变量名列显示名称
- 💬 值列显示内容（长文本自动截断）
- ✅ 状态列显示有效性
- ⚙️ 操作列提供编辑/删除按钮

### 添加环境变量

1. 点击 **"➕ 添加变量"** 按钮
2. 输入变量名（例如：`NODE_ENV`）
3. 输入变量值（例如：`production`）
4. 查看实时验证结果：
   - ✅ 绿色表示变量有效
   - ❌ 红色表示存在问题
5. 点击 **"💾 保存"** 完成添加

### 编辑环境变量

1. 在变量列表中找到要编辑的变量
2. 点击 **"✏️"** 编辑按钮
3. 修改值列中的内容
4. 点击 **"💾"** 保存或 **"❌"** 取消

### 删除环境变量

1. 在变量列表中找到要删除的变量
2. 点击 **"🗑️"** 删除按钮
3. 在确认对话框中点击 **"确定"**

⚠️ **注意**: 删除的环境变量会从 shell 配置文件中移除

### 搜索过滤

在搜索框中输入关键字，可以按变量名或值进行过滤：
- 实时搜索，无需按回车
- 支持大小写不敏感匹配
- 表格底部显示当前过滤结果数量

### 主题切换

点击右上角的 **"🌙/☀️"** 按钮切换主题：
- 🌙 暗色主题 - 适合低光环境
- ☀️ 亮色主题 - 适合明亮环境

主题偏好会在下次启动时记住

## 🏛️ 项目结构

```
tauri-rust-react-mvp/
├── src/                          # React 前端源码
│   ├── main.tsx                  # React 入口文件
│   ├── App.tsx                   # 主应用组件
│   ├── App.css                   # 应用样式（明暗主题）
│   └── index.css                 # 全局样式
├── src-tauri/                    # Rust 后端源码
│   ├── src/
│   │   └── main.rs               # Rust 后端主文件
│   │                               - get_env_vars() 获取环境变量
│   │                               - add_env_var() 添加环境变量
│   │                               - update_env_var() 更新环境变量
│   │                               - delete_env_var() 删除环境变量
│   │                               - validate_env_value() 验证环境变量
│   ├── Cargo.toml                # Rust 依赖管理
│   ├── tauri.conf.json           # Tauri 应用配置
│   │                               - 窗口大小：1200x800
│   │                               - 启用 fs 和 os 权限
│   └── build.rs                  # 构建脚本
├── index.html                    # HTML 入口
├── vite.config.ts                # Vite 配置
└── package.json                  # 前端依赖
    └── 依赖:
        ├── react ^18.2.0
        ├── @tauri-apps/api ^1.5.0
        ├── @tauri-apps/cli ^1.5.0
        └── vite ^4.4.5
```

## 💻 开发

### 开发模式

```bash
# 启动开发服务器和桌面应用
npm run tauri dev

# 仅启动前端（浏览器预览）
npm run dev
```

开发模式下支持：
- 🔥 热重载（前端修改立即生效）
- 🔄 实时编译（Rust 代码修改自动重新构建）

### 构建应用

```bash
# 构建生产版本
npm run tauri build
```

构建产物：
- macOS: `.dmg` 安装包
- Linux: `.deb` 或 `.AppImage`

## 🔧 Rust API 文档

### 命令列表

#### `get_env_vars()`
获取所有用户级环境变量

**返回值**: `Result<Vec<EnvVar>, String>`
```rust
struct EnvVar {
    key: String,
    value: String,
    is_valid: bool,
    error_message: Option<String>,
}
```

#### `add_env_var(key: String, value: String)`
添加新的环境变量

**参数**:
- `key`: 变量名
- `value`: 变量值

**返回值**: `Result<(), String>`

**验证规则**:
- 变量名不能为空
- 必须以字母或下划线开头
- 只能包含字母、数字和下划线
- 不能与已存在变量重复

#### `update_env_var(key: String, value: String)`
更新现有环境变量

**参数**:
- `key`: 变量名
- `value`: 新值

**返回值**: `Result<(), String>`

#### `delete_env_var(key: String)`
删除环境变量

**参数**:
- `key`: 要删除的变量名

**返回值**: `Result<(), String>`

#### `validate_env_value(key: &str, value: &str)`
验证环境变量值

**参数**:
- `key`: 变量名
- `value`: 变量值

**返回值**: `Result<(bool, Option<String>), String>`
- `(true, None)`: 验证通过
- `(false, Some(msg))`: 验证失败，返回错误信息

## 🐛 故障排除

### 问题：编译失败，显示 "cannot find command tauri"

**解决方案**:
```bash
npm install
# 或者全局安装 Tauri CLI
npm install -g @tauri-apps/cli
```

### 问题：权限错误，无法修改 shell 配置

**原因**: 需要写入权限到 `~/.bashrc` 或 `~/.zshrc`

**解决方案**:
1. 确保有文件的写入权限
2. 检查文件是否存在
3. 手动创建缺失的配置文件

### 问题：环境变量修改后不生效

**原因**: 当前会话的环境变量不会自动更新

**解决方案**:
```bash
# 重新加载 shell 配置
source ~/.bashrc
# 或
source ~/.zshrc
```

### 问题：路径验证过于严格

**说明**: 当前版本会对包含 `/` 或 `\` 的值进行路径存在性检查

**解决**: 如果不是实际路径，请使用相对路径或避免使用 `/` 字符

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

### 开发流程

1. Fork 此仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📸 截图

### 亮色主题
```
┌──────────────────────────────────────────────────────────┐
│ 🔧 环境变量管理器          [🌙] [🔄] [➕ 添加变量]          │
├──────────────────────────────────────────────────────────┤
│ 🔍 搜索环境变量...                                       │
├──────────────────────────────────────────────────────────┤
│ 变量名      │ 值                    │ 状态   │ 操作   │
├──────────────────────────────────────────────────────────┤
│ NODE_ENV    │ development           │ ✅ 有效 │ ✏️ 🗑️  │
│ PATH        │ /usr/local/bin:...    │ ✅ 有效 │ ✏️ 🗑️  │
│ JAVA_HOME   │ /opt/java             │ ❌ 无效 │ ✏️ 🗑️  │
└──────────────────────────────────────────────────────────┘
共 3 个环境变量 | 显示 3 个
💡 修改的环境变量会保存到 shell 配置文件中
```

### 暗色主题
[切换为暗色配色方案]

## 🙏 致谢

- [Tauri Team](https://tauri.app/) - 优秀的跨平台应用框架
- [React Team](https://reactjs.org/) - 前端 UI 库
- [Rust Team](https://www.rust-lang.org/) - 系统编程语言

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个星标！**

[⬆ 回到顶部](#环境变量管理器)

</div>
