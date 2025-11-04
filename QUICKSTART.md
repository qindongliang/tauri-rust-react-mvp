# 🚀 Tauri + React + Rust 快速开始指南

## 环境准备

在开始之前，请确保你的系统已安装以下软件：

### 1. 安装 Node.js
访问 [nodejs.org](https://nodejs.org/) 下载并安装 Node.js 18+ 版本。

验证安装：
```bash
node --version
npm --version
```

### 2. 安装 Rust
访问 [rustup.rs](https://rustup.rs/) 安装 Rust 工具链。

验证安装：
```bash
rustc --version
cargo --version
```

### 3. 安装 Tauri CLI（可选）
```bash
# 通过 npm 安装
npm install -g @tauri-apps/cli

# 或通过 Cargo 安装
cargo install tauri-cli
```

## 快速启动

### 步骤 1：安装依赖
```bash
# 安装前端依赖
npm install
```

### 步骤 2：启动开发服务器
```bash
# 启动 Tauri 开发模式（推荐）
npm run tauri dev

# 或者只启动前端（用于测试前端逻辑）
npm run dev
```

### 步骤 3：访问应用
如果一切正常，你应该会看到：
- Tauri 应用窗口自动打开，或
- 浏览器访问 http://localhost:1420

## 开发工作流

### 文件结构
```
tauri-rust-react-mvp/
├── src/                    # React 前端源码
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 入口文件
│   └── index.css          # 样式
│
├── src-tauri/             # Rust 后端源码
│   ├── src/main.rs        # Rust 主文件
│   ├── Cargo.toml         # Rust 依赖
│   └── tauri.conf.json    # Tauri 配置
│
├── index.html             # HTML 入口
├── package.json           # 前端依赖
└── vite.config.ts         # Vite 配置
```

### 开发流程

1. **修改前端代码** (`src/` 目录)
   - React 组件
   - TypeScript 类型
   - CSS 样式
   - 保存后会自动热重载

2. **修改后端代码** (`src-tauri/src/` 目录)
   - Rust 函数
   - 命令定义
   - 保存后会自动重新编译

3. **调用新命令**
   - Rust 端：使用 `#[tauri::command]` 宏
   - 前端端：使用 `invoke()` 函数
   - 注册：添加到 `generate_handler!` 列表

### 示例：添加新命令

1. **在 Rust 端添加命令** (`src-tauri/src/main.rs`)：
```rust
#[tauri::command]
fn my_new_command(input: String) -> String {
    format!("处理了: {}", input)
}
```

2. **注册命令** (`src-tauri/src/main.rs`)：
```rust
.invoke_handler(tauri::generate_handler![
    process_text,
    calculate_sum,
    fibonacci,
    get_system_info,
    my_new_command  // 添加新命令
])
```

3. **在前端调用** (`src/App.tsx`)：
```typescript
const result = await invoke<string>('my_new_command', {
  input: '你好世界'
})
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run tauri dev` | 启动开发模式 |
| `npm run dev` | 只启动前端开发服务器 |
| `npm run build` | 构建前端 |
| `npm run tauri build` | 构建完整应用 |
| `npm run preview` | 预览构建结果 |

## 故障排除

### 问题：Rust 依赖下载缓慢
```bash
# 配置国内镜像（中国用户）
# 在 ~/.cargo/config.toml 中添加：
[source.crates-io]
replace-with = "ustc"

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

### 问题：端口被占用
修改 `vite.config.ts`：
```typescript
export default defineConfig({
  server: {
    port: 3000  // 使用其他端口
  }
})
```

### 问题：权限错误（Linux/Mac）
```bash
# 确保有执行权限
chmod +x src-tauri/target/debug/tauri-app
```

## 下一步

1. **学习资源**
   - [Tauri 官方文档](https://tauri.app/)
   - [React 官方文档](https://react.dev/)
   - [Rust 程序设计语言](https://doc.rust-lang.org/)

2. **项目扩展**
   - 添加文件系统访问
   - 集成数据库
   - 使用系统通知
   - 创建自定义菜单
   - 实现窗口管理

3. **最佳实践**
   - 代码分离：前端逻辑 vs 业务逻辑
   - 错误处理：始终处理可能的错误
   - 类型安全：使用 TypeScript 和 Rust 类型
   - 测试：编写单元测试和集成测试

## 获取帮助

- [Tauri Discord 社区](https://discord.com/invite/tauri)
- [GitHub Issues](https://github.com/tauri-apps/tauri/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tauri)

---

**祝你开发愉快！** 🎉
