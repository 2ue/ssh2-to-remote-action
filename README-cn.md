# SSH2 SFTP 上传 Action

[![CI](https://github.com/2ue/ssh2-to-remote-action/actions/workflows/ci.yml/badge.svg)](https://github.com/2ue/ssh2-to-remote-action/actions/workflows/ci.yml)
[![Coverage Status](./badges/coverage.svg)](./badges/coverage.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个强大的 GitHub Action，用于通过 SSH2 SFTP 协议将本地目录上传到远程服务器。使用 TypeScript 构建，具有全面的错误处理机制。

[English](./README.md) | [中文文档](./README-cn.md)

## ✨ 特性

- 🚀 **TypeScript** - 类型安全，全面的错误处理
- 🔐 **多种认证方式** - 支持密码、私钥或 SSH 代理认证
- 📁 **目录上传** - 上传整个目录并追踪进度
- 💾 **备份支持** - 上传前可选的远程目录备份
- 🔄 **重试机制** - 可配置的连接重试和指数退避
- 📊 **详细输出** - 追踪上传文件数量和操作状态
- ⚡ **并发操作** - 可配置的并发限制以优化性能
- 🛡️ **安全优先** - 不记录敏感信息，安全的连接处理

## 📦 使用方法

### 基本用法

```yaml
name: 部署到服务器
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        
      - name: 上传到服务器
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SERVER_PASSWORD }}
          local_dir: './dist'
          remote_base_dir: '/var/www/html'
```

### 高级用法（私钥认证 + 备份）

```yaml
      - name: 上传并备份
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          port: 2222
          username: ${{ secrets.SERVER_USERNAME }}
          privateKey: ${{ secrets.SSH_PRIVATE_KEY }}
          passphrase: ${{ secrets.SSH_PASSPHRASE }}
          local_dir: './build'
          remote_base_dir: '/home/user/app'
          remote_bak_path: '/home/user/backups'
          retries: 3
          retry_factor: 2
          readyTimeout: 30000
          debug: true
```

## 📋 输入参数

### 必需参数

| 参数 | 描述 | 示例 |
|------|------|------|
| `host` | 远程服务器主机名或 IP | `example.com` |
| `username` | SSH 用户名 | `ubuntu` |
| `local_dir` | 要上传的本地目录 | `./dist` |
| `remote_base_dir` | 远程目标目录 | `/var/www/html` |

### 认证方式（选择其一）

| 参数 | 描述 | 示例 |
|------|------|------|
| `password` | SSH 密码 | `${{ secrets.PASSWORD }}` |
| `privateKey` | SSH 私钥内容 | `${{ secrets.SSH_KEY }}` |
| `agent` | SSH 代理套接字路径 | `/tmp/ssh-agent.sock` |

### 可选参数

| 参数 | 描述 | 默认值 | 示例 |
|------|------|--------|------|
| `port` | SSH 端口 | `22` | `2222` |
| `passphrase` | 私钥密码短语 | | `${{ secrets.PASSPHRASE }}` |
| `remote_bak_path` | 备份目录路径 | | `/backups` |
| `forceIPv4` | 强制 IPv4 连接 | `false` | `true` |
| `forceIPv6` | 强制 IPv6 连接 | `false` | `true` |
| `readyTimeout` | SSH 握手超时时间（毫秒） | `20000` | `30000` |
| `strictVendor` | 严格服务器供应商检查 | `false` | `true` |
| `debug` | 启用调试日志 | `false` | `true` |
| `retries` | 连接重试次数 | `1` | `3` |
| `retry_factor` | 重试延时倍数 | `2` | `1.5` |
| `retry_minTimeout` | 最小重试延时（毫秒） | `1000` | `2000` |
| `promiseLimit` | 并发操作限制 | `10` | `5` |

## 📤 输出

| 输出 | 描述 | 示例 |
|------|------|------|
| `uploaded_files` | 上传的文件数量 | `42` |
| `success` | 上传操作状态 | `true` |
| `error` | 失败时的错误信息 | `连接超时` |

## 🔒 安全注意事项

### 密钥管理

将敏感信息存储为 GitHub 仓库密钥：

1. 进入你的仓库 → Settings → Secrets and variables → Actions
2. 添加以下密钥：
   - `SERVER_HOST` - 服务器主机名
   - `SERVER_USERNAME` - SSH 用户名
   - `SERVER_PASSWORD` - SSH 密码（使用密码认证时）
   - `SSH_PRIVATE_KEY` - SSH 私钥内容（使用密钥认证时）
   - `SSH_PASSPHRASE` - 私钥密码短语（如需要）

### SSH 密钥认证（推荐）

为了更好的安全性，建议使用 SSH 密钥认证：

```bash
# 生成 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions@your-repo"

# 将公钥复制到服务器
ssh-copy-id -i ~/.ssh/id_rsa.pub user@server

# 将私钥内容添加到 GitHub 密钥中，命名为 SSH_PRIVATE_KEY
cat ~/.ssh/id_rsa
```

## 🚀 使用示例

### 部署 React 应用

```yaml
name: 部署 React 应用
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: 安装依赖并构建
        run: |
          npm ci
          npm run build
          
      - name: 部署到服务器
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          privateKey: ${{ secrets.SSH_PRIVATE_KEY }}
          local_dir: './build'
          remote_base_dir: '/var/www/html'
          remote_bak_path: '/var/backups/www'
          
      - name: 检查部署状态
        if: success()
        run: echo "✅ 成功部署了 ${{ steps.deploy.outputs.uploaded_files }} 个文件！"
```

### 多环境部署

```yaml
name: 多环境部署
on:
  push:
    branches: [ main, staging ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: 
          - name: staging
            branch: staging
            host: staging.example.com
            path: /var/www/staging
          - name: production
            branch: main
            host: example.com
            path: /var/www/html
            
    steps:
      - uses: actions/checkout@v4
        if: github.ref == format('refs/heads/{0}', matrix.environment.branch)
        
      - name: 部署到 ${{ matrix.environment.name }}
        if: github.ref == format('refs/heads/{0}', matrix.environment.branch)
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ matrix.environment.host }}
          username: ${{ secrets.SERVER_USERNAME }}
          privateKey: ${{ secrets.SSH_PRIVATE_KEY }}
          local_dir: './dist'
          remote_base_dir: ${{ matrix.environment.path }}
          remote_bak_path: '/backups/${{ matrix.environment.name }}'
          retries: 3
          debug: true
```

### Docker 应用部署

```yaml
name: Docker 应用部署
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 构建 Docker 镜像
        run: |
          docker build -t myapp:latest .
          docker save myapp:latest > myapp.tar
          
      - name: 上传 Docker 镜像
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          privateKey: ${{ secrets.SSH_PRIVATE_KEY }}
          local_dir: './myapp.tar'
          remote_base_dir: '/opt/deploy'
          
      - name: 部署 Docker 容器
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/deploy
            docker load < myapp.tar
            docker stop myapp || true
            docker rm myapp || true
            docker run -d --name myapp -p 80:3000 myapp:latest
```

## 🛠️ 开发

### 前置要求

- Node.js 20+
- TypeScript
- Jest 测试框架

### 设置

```bash
# 克隆仓库
git clone https://github.com/2ue/ssh2-to-remote-action.git
cd ssh2-to-remote-action

# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 运行测试
npm test

# 运行所有检查
npm run all
```

### 项目结构

```
src/
├── config/          # 输入验证和处理
├── ssh/             # SSH 连接管理
├── upload/          # 文件上传逻辑
├── types/           # TypeScript 类型定义
├── main.ts          # 主要 Action 逻辑
└── index.ts         # 入口点

__tests__/           # 测试文件
dist/                # 编译输出
```

## 🤝 贡献

1. Fork 这个仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 进行更改并添加测试
4. 运行测试套件：`npm run all`
5. 提交更改：`git commit -m 'Add amazing feature'`
6. 推送到分支：`git push origin feature/amazing-feature`
7. 开启 Pull Request

## 🐛 故障排除

### 常见问题

**连接超时**
```yaml
# 增加超时时间
readyTimeout: 30000  # 30秒
retries: 3
```

**权限被拒绝**
```bash
# 检查服务器权限
ssh user@server 'ls -la /target/directory'
```

**私钥格式问题**
```bash
# 确保私钥格式正确
ssh-keygen -p -m PEM -f ~/.ssh/id_rsa
```

**上传速度慢**
```yaml
# 调整并发限制
promiseLimit: 5  # 减少并发数
```

## 📄 许可证

本项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 基于 [ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client) 构建
- 由 [GitHub Actions](https://github.com/features/actions) 驱动
- TypeScript 支持通过 [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core) 提供

## 📞 支持

- 🐛 [报告问题](https://github.com/2ue/ssh2-to-remote-action/issues)
- 💡 [功能请求](https://github.com/2ue/ssh2-to-remote-action/issues/new?template=feature_request.md)
- 📖 [文档](https://github.com/2ue/ssh2-to-remote-action/wiki)

## 🆚 与其他工具对比

| 功能 | ssh2-to-remote-action | scp-action | rsync-action |
|------|----------------------|------------|--------------|
| TypeScript | ✅ | ❌ | ❌ |
| 备份功能 | ✅ | ❌ | ❌ |
| 重试机制 | ✅ | ❌ | ✅ |
| 进度追踪 | ✅ | ❌ | ❌ |
| 多种认证 | ✅ | ✅ | ✅ |
| 错误处理 | ✅ | 基础 | 基础 |

---

用 ❤️ 为 GitHub Actions 社区打造