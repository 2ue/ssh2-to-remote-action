#### SSH2 SFTP Upload Action

A GitHub Action for uploading a local directory to a remote server via the SSH2
SFTP protocol.

You should store sensitive information such as host addresses, ports, usernames,
and passwords as GitHub repository secrets and reference those secrets in your
workflow for security.

[English Doc]('./README.md') [中文文档]('./README-cn.md')

##### Usage

To use this Action, you need to create a YAML file in the `.github/workflows`
directory of your GitHub repository, such as `deploy.yml`, and add the following
content:

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

Make sure to replace `${{ secrets.HOST }}`, `${{ secrets.PORT }}`,
`${{ secrets.USERNAME }}`, and `${{ secrets.PASSWORD }}` with the actual
connection information of your SFTP server, which should be stored as repository
secrets.

##### Input Parameters

- `host`: **Required** - The remote host address.
- `port`: **Required** - The port of the remote host.
- `username`: **Required** - The username for authentication.
- `password`: **Required** - The password for authentication.
- `local_dir`: **Required** - The local directory path to upload.
- `remote_base_dir`: **Required** - The base directory path on the remote
  server.
- `remote_bak_path`: **Optional** - The backup directory path on the remote
  server.
