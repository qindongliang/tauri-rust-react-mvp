# Tauri + React + Rust MVP

这是一个最小可用的 Tauri + React + Rust 应用程序示例，演示了前端 React 与后端 Rust 之间的通信。

## 项目结构

```
tauri-rust-react-mvp/
├── src/
│   ├── main.tsx          # React 入口文件
│   ├── App.tsx           # 主应用组件
│   └── index.css         # 样式文件
├── src-tauri/
│   ├── src/
│   │   └── main.rs       # Rust 后端主文件
│   ├── Cargo.toml        # Rust 依赖管理
│   ├── tauri.conf.json   # Tauri 配置
│   └── build.rs          # 构建脚本
├── index.html            # HTML 入口
├── vite.config.ts        # Vite 配置
└── package.json          # 前端依赖
```

## 功能

这个 MVP 展示了以下功能：

### 🎯 核心功能
1. **系统信息获取** - 从 Rust 后端获取操作系统和架构信息
2. **文本处理** - Rust 后端反转输入的字符串并返回处理结果
3. **数学计算** - 执行简单的加法运算
4. **斐波那契数列** - 计算第 n 个斐波那契数

### 💡 技术特性
- React 前端用户界面
- Rust 后端命令处理
- 前后端之间的异步通信
- TypeScript 类型安全
- 响应式设计
- 错误处理机制

每个功能都展示了：
- 前端如何调用 Rust 命令
- 数据如何在前端和后端之间传递
- 错误如何处理和显示
- 异步操作的管理

## 安装依赖

首先，确保你已经安装了以下工具：
- [Node.js](https://nodejs.org/) (版本 18 或更高)
- [Rust](https://rustup.rs/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites) (可选，可以直接使用 npm run tauri)

安装前端依赖：

```bash
npm install
```

## 运行应用

有几种方式可以运行应用：

### 1. 开发模式（推荐）

在开发模式下，前端使用 Vite 热重载，后端使用 Tauri 的开发模式：

```bash
npm run tauri dev
```

这将：
- 启动 Vite 开发服务器 (http://localhost:1420)
- 编译并运行 Tauri 应用
- 监听文件变化并自动重新加载

### 2. 仅前端开发

如果你只想开发 React 前端：

```bash
npm run dev
```

然后在浏览器中访问 http://localhost:1420

### 3. 构建应用

为生产环境构建应用：

```bash
npm run tauri build
```

这将：
- 构建 React 前端到 `dist` 目录
- 编译 Rust 代码
- 生成可执行文件或安装包

## 代码说明

### React 前端 (`src/App.tsx`)

主要功能：

1. **系统信息展示**
   - 应用启动时自动加载系统信息
   - 显示操作系统、架构和 Rust 版本

2. **调用 Rust 命令**
   - 使用 `@tauri-apps/api` 的 `invoke` 函数
   - 支持多种数据类型：字符串、数字、JSON
   - 自动处理 TypeScript 类型转换

```typescript
// 示例：获取系统信息
const info = await invoke<SystemInfo>('get_system_info')

// 示例：文本处理
const result = await invoke<ProcessOutput>('process_text', { text })

// 示例：数学计算
const sum = await invoke<number>('calculate_sum', { a: 10, b: 20 })

// 示例：斐波那契计算
const fib = await invoke<number>('fibonacci', { n: 10 })
```

3. **错误处理**
   - 统一的错误状态管理
   - 用户友好的错误提示
   - try-catch 包装异步操作

### Rust 后端 (`src-tauri/src/main.rs`)

定义四个核心命令：

1. **`process_text`** - 文本处理
   - 输入：字符串
   - 输出：JSON 对象（包含结果、原文、长度）
   - 功能：反转字符串并添加处理标识

2. **`calculate_sum`** - 数字加法
   - 输入：两个 i64 数字
   - 输出：i64 结果
   - 功能：简单加法运算

3. **`fibonacci`** - 斐波那契数列
   - 输入：u32 整数 n
   - 输出：Result<u64, String>
   - 功能：计算第 n 个斐波那契数（n ≤ 50）

4. **`get_system_info`** - 系统信息
   - 输入：无参数
   - 输出：JSON 值
   - 功能：返回操作系统、架构和版本信息

```rust
#[tauri::command]
fn process_text(text: String) -> Result<ProcessOutput, String> {
    if text.is_empty() {
        return Err("Input text cannot be empty".to_string());
    }

    let reversed: String = text.chars().rev().collect();
    let output = ProcessOutput {
        result: format!("处理完成: {}", reversed),
        original: text.clone(),
        length: text.len(),
    };
    Ok(output)
}
```

### 命令注册

所有命令在 main 函数中注册：

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            process_text,
            calculate_sum,
            fibonacci,
            get_system_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 学习要点

### 1. **通信机制**
   - 前端使用 `invoke<T>` 调用 Rust 函数，支持类型参数
   - 参数通过对象字面量传递：`{ param1: value1, param2: value2 }`
   - 返回值自动序列化/反序列化
   - 支持 Result 类型和错误处理

### 2. **命令注册**
   - Rust 端使用 `tauri::generate_handler!` 宏注册命令
   - 命令名称必须与前端调用的名称完全一致
   - 支持多个命令的批量注册
   - 命令可以返回 Result<T, E> 进行错误处理

### 3. **数据序列化**
   - 使用 `serde` 库进行 JSON 序列化/反序列化
   - Rust 端使用 `#[derive(Serialize, Deserialize)]`
   - TypeScript 接口与 Rust 结构体对应
   - 支持复杂的嵌套数据结构

### 4. **类型安全**
   - TypeScript 泛型提供编译时类型检查
   - Rust 强类型系统保证运行时安全
   - 前后端类型需保持一致

### 5. **错误处理**
   - Rust 端：使用 Result 类型返回错误
   - 前端：try-catch 捕获异常
   - 用户友好的错误信息展示
   - 空状态和加载状态管理

### 6. **配置管理**
   - `tauri.conf.json` 配置应用元数据和权限
   - `allowlist` 控制前端可以访问的 API
   - `build` 配置开发/构建命令
   - `windows` 配置应用窗口属性

## 下一步

这个 MVP 为你提供了：
- 基础的项目结构
- 前后端通信机制
- 开发工作流

你可以基于此扩展：
- 添加更多 Rust 命令
- 访问文件系统、数据库或系统 API
- 使用更复杂的 Rust 库
- 集成状态管理（如 Redux、Zustand）

## 故障排除

### 图标问题

如果遇到 "failed to read icon" 错误：

**方案 1：使用自动生成的图标**
```bash
# 创建一个 SVG 图标
cat > src-tauri/icons/icon.svg << 'EOF'
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#667eea"/>
  <text x="512" y="650" font-family="Arial" font-size="600" fill="white" text-anchor="middle">T</text>
</svg>
EOF

# 生成所需的所有图标格式
npm run tauri icon
```

**方案 2：创建简单的 PNG 图标**
```bash
# 使用 Python PIL 创建
python3 << 'EOF'
from PIL import Image, ImageDraw
img = Image.new('RGBA', (32, 32), (102, 126, 234, 255))
draw = ImageDraw.Draw(img)
draw.ellipse([4, 4, 28, 28], fill=(255, 255, 255, 255))
img.save('src-tauri/icons/icon.png')
print("Created icon.png")
EOF
```

**方案 3：禁用打包（开发模式）**
在 `src-tauri/tauri.conf.json` 中设置：
```json
{
  "bundle": {
    "active": false
  }
}
```

### Rust 依赖问题

如果遇到 Rust 依赖问题：

```bash
cd src-tauri
cargo update
```

### 前端依赖问题

如果遇到 Node.js 依赖问题：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 端口冲突

如果 1420 端口被占用，修改 `vite.config.ts` 中的 `server.port` 配置。

## 资源

- [Tauri 官方文档](https://tauri.app/)
- [Tauri v1 API 参考](https://tauri.app/v1/api)
- [Rust 与 Tauri 教程](https://tauri.app/v1/guides)
- [React 文档](https://react.dev/)

---

**提示**：这个 MVP 专注于展示最基础的通信模式。实际项目中可能需要更复杂的错误处理、数据验证和状态管理。
