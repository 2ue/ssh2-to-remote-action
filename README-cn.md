# ssh2-to-remote-action

一个 GitHub Action，用于将本地目录通过 SSH2 SFTP 协议上传到远程服务器。

您应该将敏感信息如主机地址、端口、用户名和密码存储为 GitHub repository secrets，
并在 workflow 中引用这些 secrets，以保证安全性。

[English Doc]('./README.md') [中文文档]('./README-cn.md')

##### 使用介绍

要使用此 Action，您需要在 GitHub 仓库的 `.github/workflows` 目录下创建一个 YAML
文件，例如 `deploy.yml`，并添加以下内容：

```yaml
jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Upload directory to SFTP server
        uses: your-username/ssh2-sftp-upload-action@v1
        with:
          host: ${{ secrets.HOST }}
          port: ${{ secrets.PORT }}
          username: ${{ secrets.USERNAME }}
          password: ${{ secrets.PASSWORD }}
          local_dir: './public'
          remote_base_dir: '/home/username/web'
          remote_bak_path: '/home/username/backup'
```

确保将 `${{ secrets.HOST }}`、`${{ secrets.PORT }}`、`${{ secrets.USERNAME }}`
和 `${{ secrets.PASSWORD }}` 替换为您的 SFTP 服务器的实际连接信息，这些信息应该
作为 repository secrets 存储。

##### 参数说明

- `host`: **必填** - 远程主机地址。
- `port`: **必填** - 远程主机端口。
- `username`: **必填** - 用于认证的用户名。
- `password`: **必填** - 用于认证的密码。
- `local_dir`: **必填** - 要上传的本地目录路径。
- `remote_base_dir`: **必填** - 远程服务器的基础目录路径。
- `remote_bak_path`: **可选** - 远程服务器的备份目录路径。
