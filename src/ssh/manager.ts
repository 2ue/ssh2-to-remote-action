import SSH2SftpClient from 'ssh2-sftp-client'
import * as core from '@actions/core'
import { SSHConfig } from '../types'

export class SSHManager {
  private sftp: SSH2SftpClient
  private config: SSHConfig

  constructor(config: SSHConfig) {
    this.config = config
    this.sftp = new SSH2SftpClient('ssh2-to-remote-action')
  }

  async connect(): Promise<void> {
    try {
      const connectionConfig: any = {
        host: this.config.host,
        port: this.config.port,
        username: this.config.username
      }

      // 密码或私钥认证
      if (this.config.password) {
        connectionConfig.password = this.config.password
      }
      if (this.config.privateKey) {
        connectionConfig.privateKey = this.config.privateKey
      }
      if (this.config.passphrase) {
        connectionConfig.passphrase = this.config.passphrase
      }
      if (this.config.agent) {
        connectionConfig.agent = this.config.agent
      }

      // 可选配置
      if (this.config.forceIPv4)
        connectionConfig.forceIPv4 = this.config.forceIPv4
      if (this.config.forceIPv6)
        connectionConfig.forceIPv6 = this.config.forceIPv6
      if (this.config.readyTimeout)
        connectionConfig.readyTimeout = this.config.readyTimeout
      if (this.config.strictVendor)
        connectionConfig.strictVendor = this.config.strictVendor
      if (this.config.debug) connectionConfig.debug = this.config.debug
      if (this.config.retries) connectionConfig.retries = this.config.retries
      if (this.config.retry_factor)
        connectionConfig.retry_factor = this.config.retry_factor
      if (this.config.retry_minTimeout)
        connectionConfig.retry_minTimeout = this.config.retry_minTimeout
      if (this.config.promiseLimit)
        connectionConfig.promiseLimit = this.config.promiseLimit

      core.info(`Connecting to ${this.config.host}:${this.config.port}...`)
      await this.sftp.connect(connectionConfig)
      core.info('SSH connection established successfully')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      core.error(`SSH connection failed: ${errorMessage}`)
      throw new Error(`Failed to connect to SSH server: ${errorMessage}`)
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.sftp) {
        await this.sftp.end()
        core.info('SSH connection closed')
      }
    } catch (error) {
      core.warning(`Error closing SSH connection: ${error}`)
    }
  }

  getSftpClient(): SSH2SftpClient {
    return this.sftp
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sftp.list('.')
      return true
    } catch (error) {
      core.warning(`Connection test failed: ${error}`)
      return false
    }
  }
}
