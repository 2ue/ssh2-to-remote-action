# SSH2 SFTP Upload Action

[![CI](https://github.com/2ue/ssh2-to-remote-action/actions/workflows/ci.yml/badge.svg)](https://github.com/2ue/ssh2-to-remote-action/actions/workflows/ci.yml)
[![Coverage Status](./badges/coverage.svg)](./badges/coverage.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust GitHub Action for uploading a local directory to a remote server via SSH2 SFTP protocol. Built with TypeScript and comprehensive error handling.

[English](./README.md) | [中文文档](./README-cn.md)

## ✨ Features

- 🚀 **TypeScript** - Type-safe with comprehensive error handling
- 🔐 **Multiple Auth Methods** - Password, private key, or SSH agent authentication
- 📁 **Directory Upload** - Upload entire directories with progress tracking
- 💾 **Backup Support** - Optional remote directory backup before upload
- 🔄 **Retry Logic** - Configurable connection retries with exponential backoff
- 📊 **Detailed Outputs** - Track uploaded files count and operation status
- ⚡ **Concurrent Operations** - Configurable promise limit for optimal performance
- 🛡️ **Security First** - No secrets logged, secure connection handling

## 📦 Usage

### Basic Usage

```yaml
name: Deploy to Server
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Upload to Server
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          password: ${{ secrets.SERVER_PASSWORD }}
          local_dir: './dist'
          remote_base_dir: '/var/www/html'
```

### Advanced Usage with Private Key and Backup

```yaml
      - name: Upload with Backup
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

## 📋 Inputs

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `host` | Remote server hostname or IP | `example.com` |
| `username` | SSH username | `ubuntu` |
| `local_dir` | Local directory to upload | `./dist` |
| `remote_base_dir` | Remote destination directory | `/var/www/html` |

### Authentication (Choose One)

| Input | Description | Example |
|-------|-------------|---------|
| `password` | SSH password | `${{ secrets.PASSWORD }}` |
| `privateKey` | SSH private key content | `${{ secrets.SSH_KEY }}` |
| `agent` | Path to SSH agent socket | `/tmp/ssh-agent.sock` |

### Optional Inputs

| Input | Description | Default | Example |
|-------|-------------|---------|---------|
| `port` | SSH port | `22` | `2222` |
| `passphrase` | Private key passphrase | | `${{ secrets.PASSPHRASE }}` |
| `remote_bak_path` | Backup directory path | | `/backups` |
| `forceIPv4` | Force IPv4 connection | `false` | `true` |
| `forceIPv6` | Force IPv6 connection | `false` | `true` |
| `readyTimeout` | SSH handshake timeout (ms) | `20000` | `30000` |
| `strictVendor` | Strict server vendor check | `false` | `true` |
| `debug` | Enable debug logging | `false` | `true` |
| `retries` | Connection retry attempts | `1` | `3` |
| `retry_factor` | Retry delay multiplier | `2` | `1.5` |
| `retry_minTimeout` | Min retry delay (ms) | `1000` | `2000` |
| `promiseLimit` | Concurrent operation limit | `10` | `5` |

## 📤 Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `uploaded_files` | Number of files uploaded | `42` |
| `success` | Upload operation status | `true` |
| `error` | Error message if failed | `Connection timeout` |

## 🔒 Security Considerations

### Secrets Management

Store sensitive information as GitHub repository secrets:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `SERVER_HOST` - Your server hostname
   - `SERVER_USERNAME` - SSH username
   - `SERVER_PASSWORD` - SSH password (if using password auth)
   - `SSH_PRIVATE_KEY` - SSH private key content (if using key auth)
   - `SSH_PASSPHRASE` - Private key passphrase (if needed)

### SSH Key Authentication (Recommended)

For better security, use SSH key authentication:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions@your-repo"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub user@server

# Add private key content to GitHub secrets as SSH_PRIVATE_KEY
cat ~/.ssh/id_rsa
```

## 🚀 Examples

### Deploy React App

```yaml
name: Deploy React App
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install and Build
        run: |
          npm ci
          npm run build
          
      - name: Deploy to Server
        uses: 2ue/ssh2-to-remote-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          privateKey: ${{ secrets.SSH_PRIVATE_KEY }}
          local_dir: './build'
          remote_base_dir: '/var/www/html'
          remote_bak_path: '/var/backups/www'
          
      - name: Check Deployment
        if: success()
        run: echo "✅ Deployed ${{ steps.deploy.outputs.uploaded_files }} files successfully!"
```

### Multi-Environment Deployment

```yaml
name: Multi-Environment Deploy
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
        
      - name: Deploy to ${{ matrix.environment.name }}
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

## 🛠️ Development

### Prerequisites

- Node.js 20+
- TypeScript
- Jest for testing

### Setup

```bash
# Clone repository
git clone https://github.com/2ue/ssh2-to-remote-action.git
cd ssh2-to-remote-action

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run all checks
npm run all
```

### Project Structure

```
src/
├── config/          # Input validation and processing
├── ssh/             # SSH connection management
├── upload/          # File upload logic
├── types/           # TypeScript type definitions
├── main.ts          # Main action logic
└── index.ts         # Entry point

__tests__/           # Test files
dist/                # Compiled output
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run all`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client)
- Powered by [GitHub Actions](https://github.com/features/actions)
- TypeScript support via [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core)

## 📞 Support

- 🐛 [Report Issues](https://github.com/2ue/ssh2-to-remote-action/issues)
- 💡 [Request Features](https://github.com/2ue/ssh2-to-remote-action/issues/new?template=feature_request.md)
- 📖 [Documentation](https://github.com/2ue/ssh2-to-remote-action/wiki)

---

Made with ❤️ for the GitHub Actions community
