import * as core from '@actions/core'
import { getActionInputs } from './config/inputs'
import { SSHManager } from './ssh/manager'
import { FileUploader } from './upload/uploader'

export async function run(): Promise<void> {
  let sshManager: SSHManager | null = null

  try {
    core.info('SSH2 Remote Action starting...')

    // 获取输入参数
    const inputs = getActionInputs()
    core.info(
      `Connecting to ${inputs.host}:${inputs.port} as ${inputs.username}`
    )

    // 创建 SSH 连接
    sshManager = new SSHManager(inputs)
    await sshManager.connect()

    // 测试连接
    const isConnected = await sshManager.testConnection()
    if (!isConnected) {
      throw new Error('SSH connection test failed')
    }

    // 创建文件上传器
    const uploader = new FileUploader(sshManager, {
      localDir: inputs.localDir,
      remoteBaseDir: inputs.remoteBaseDir,
      remoteBakPath: inputs.remoteBakPath
    })

    // 执行上传
    const result = await uploader.upload()

    if (result.success) {
      core.info(
        `Upload completed successfully! Uploaded ${result.uploadedFiles} files.`
      )
      core.setOutput('uploaded_files', result.uploadedFiles.toString())
      core.setOutput('success', 'true')
    } else {
      const errorMsg = result.errors?.join(', ') || 'Unknown error'
      core.setFailed(`Upload failed: ${errorMsg}`)
      core.setOutput('success', 'false')
      core.setOutput('error', errorMsg)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    core.error(`Action failed: ${errorMessage}`)
    core.setFailed(errorMessage)
    core.setOutput('success', 'false')
    core.setOutput('error', errorMessage)
  } finally {
    // 确保 SSH 连接被关闭
    if (sshManager) {
      await sshManager.disconnect()
    }
  }
}

// 如果直接运行此文件，则执行 run 函数
if (require.main === module) {
  run().catch(error => {
    core.error(`Unhandled error: ${error}`)
    process.exit(1)
  })
}
