import * as core from '@actions/core'
import * as fs from 'fs/promises'
import * as path from 'path'
import { SSHManager } from '../ssh/manager'
import { UploadConfig, UploadResult } from '../types'

export class FileUploader {
  private sshManager: SSHManager
  private config: UploadConfig

  constructor(sshManager: SSHManager, config: UploadConfig) {
    this.sshManager = sshManager
    this.config = config
  }

  async upload(): Promise<UploadResult> {
    const errors: string[] = []
    let uploadedFiles = 0

    try {
      // 检查本地目录是否存在
      await this.validateLocalDirectory()

      // 备份远程目录（如果指定）
      if (this.config.remoteBakPath) {
        await this.backupRemoteDirectory()
      }

      // 上传文件
      core.info(
        `Starting upload: ${this.config.localDir} => ${this.config.remoteBaseDir}`
      )

      const sftp = this.sshManager.getSftpClient()

      // 使用 uploadDir 方法上传整个目录
      await sftp.uploadDir(this.config.localDir, this.config.remoteBaseDir, {
        filter: (localPath: string, isDirectory: boolean) => {
          core.info(
            `Processing: ${localPath} ${isDirectory ? '(directory)' : '(file)'}`
          )
          if (!isDirectory) {
            uploadedFiles++
          }
          return true
        }
      })

      core.info(
        `Successfully uploaded ${uploadedFiles} files to ${this.config.remoteBaseDir}`
      )

      return {
        success: true,
        uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      core.error(`Upload failed: ${errorMessage}`)
      errors.push(errorMessage)

      return {
        success: false,
        uploadedFiles,
        errors
      }
    }
  }

  private async validateLocalDirectory(): Promise<void> {
    try {
      const stats = await fs.stat(this.config.localDir)
      if (!stats.isDirectory()) {
        throw new Error(
          `Local path is not a directory: ${this.config.localDir}`
        )
      }
      core.info(`Local directory validated: ${this.config.localDir}`)
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        throw new Error(
          `Local directory does not exist: ${this.config.localDir}`
        )
      }
      throw error
    }
  }

  private async backupRemoteDirectory(): Promise<void> {
    try {
      const sftp = this.sshManager.getSftpClient()
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.posix.join(
        this.config.remoteBakPath!,
        `backup-${timestamp}`
      )

      core.info(
        `Creating backup: ${this.config.remoteBaseDir} => ${backupPath}`
      )

      // 检查远程目录是否存在
      const exists = await sftp.exists(this.config.remoteBaseDir)
      if (exists) {
        // 创建备份目录
        await sftp.mkdir(this.config.remoteBakPath!, true)
        // 复制文件
        await sftp.rcopy(this.config.remoteBaseDir, backupPath)
        core.info(`Backup created successfully at: ${backupPath}`)
      } else {
        core.info('Remote directory does not exist, skipping backup')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      core.warning(`Backup failed: ${errorMessage}`)
      // 备份失败不应该阻止上传进程
    }
  }
}
