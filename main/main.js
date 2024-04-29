const SSH2SftpClient = require('ssh2-sftp-client')
const core = require('@actions/core')
const { execSync } = require('child_process')
const path = require('path')

async function run() {
  console.log('-----enter----')
  execSync('pwd', { stdio: 'inherit' })
  execSync('ls -al', { stdio: 'inherit' })
  const sftp = new SSH2SftpClient()
  const host = core.getInput('host', { required: true })
  const port = core.getInput('port') || 22
  const username = core.getInput('username', { required: true })
  const password = core.getInput('password', { required: true })
  // const forceIPv4 = core.getInput('forceIPv4')
  // const forceIPv6 = core.getInput('forceIPv6')
  // const agent = core.getInput('agent')
  // const privateKey = core.getInput('privateKey')
  // const passphrase = core.getInput('passphrase')
  // const readyTimeout = core.getInput('readyTimeout')
  // const strictVendor = core.getInput('strictVendor')
  // const debug = core.getInput('debug')
  // const retries = core.getInput('retries')
  // const retry_factor = core.getInput('retry_factor')
  // const retry_minTimeout = core.getInput('retry_minTimeout')
  // const promiseLimit = core.getInput('promiseLimit')
  const localDir1 = core.getInput('local_dir', { required: true })
  const localDir = path.join(__dirname, localDir1)
  const remoteBaseDir = core.getInput('remote_base_dir', { required: true })
  // const remoteBakPath = core.getInput('remote_bak_path')
  try {
    console.log('Start connect: ', localDir1, localDir)
    execSync('pwd', { stdio: 'inherit' })
    execSync('ls -al localDir1', { stdio: 'inherit' })
    await sftp.connect({
      host,
      port,
      username,
      password
      // forceIPv4,
      // forceIPv6,
      // agent,
      // privateKey,
      // passphrase,
      // readyTimeout,
      // strictVendor,
      // debug,
      // retries,
      // retry_factor,
      // retry_minTimeout,
      // promiseLimit
    })
    // if (remoteBakPath) {
    //   console.log('Start Backup: ', remoteBaseDir, '=>', remoteBakPath)
    //   await sftp.rcopy(remoteBaseDir, `${remoteBakPath}/backup`)
    // }
    console.log('Start upload: ', localDir1, '=>', remoteBaseDir)
    await sftp.uploadDir(localDir1, remoteBaseDir, {
      filter: (localPath, isDir) => {
        core.debug('Upload: ', localPath, isDir)
        return true
      }
    })

    console.log(
      `Successfully uploaded directory ${localDir} to ${remoteBaseDir}`
    )
  } catch (error) {
    // @ts-ignore
    core.setFailed(`Error uploading directory: ${error.message}`)
    throw error
  } finally {
    if (sftp) {
      await sftp.end()
    }
  }
}

module.exports = {
  run
}
