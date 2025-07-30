import * as core from '@actions/core'
import { run } from '../src/main'
import { SSHManager } from '../src/ssh/manager'
import { FileUploader } from '../src/upload/uploader'

// Mock 模块
jest.mock('@actions/core')
jest.mock('../src/ssh/manager')
jest.mock('../src/upload/uploader')

const mockCore = core as jest.Mocked<typeof core>
const MockSSHManager = SSHManager as jest.MockedClass<typeof SSHManager>
const MockFileUploader = FileUploader as jest.MockedClass<typeof FileUploader>

describe('SSH2 Remote Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // 设置默认输入
    mockCore.getInput.mockImplementation((name: string, options?: any) => {
      const inputs: Record<string, string> = {
        host: 'test.example.com',
        port: '22',
        username: 'testuser',
        password: 'testpass',
        local_dir: './test-dir',
        remote_base_dir: '/home/test/upload'
      }
      return inputs[name] || ''
    })

    mockCore.getBooleanInput.mockReturnValue(false)
  })

  describe('run', () => {
    it('should successfully upload files', async () => {
      // Mock SSH 连接成功
      const mockSshInstance = {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        testConnection: jest.fn().mockResolvedValue(true),
        getSftpClient: jest.fn()
      }
      MockSSHManager.mockImplementation(() => mockSshInstance as any)

      // Mock 上传成功
      const mockUploaderInstance = {
        upload: jest.fn().mockResolvedValue({
          success: true,
          uploadedFiles: 10,
          errors: undefined
        })
      }
      MockFileUploader.mockImplementation(() => mockUploaderInstance as any)

      await run()

      expect(MockSSHManager).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'test.example.com',
          port: 22,
          username: 'testuser',
          password: 'testpass'
        })
      )

      expect(mockSshInstance.connect).toHaveBeenCalled()
      expect(mockSshInstance.testConnection).toHaveBeenCalled()
      expect(mockUploaderInstance.upload).toHaveBeenCalled()
      expect(mockSshInstance.disconnect).toHaveBeenCalled()

      expect(mockCore.setOutput).toHaveBeenCalledWith('uploaded_files', '10')
      expect(mockCore.setOutput).toHaveBeenCalledWith('success', 'true')
      expect(mockCore.info).toHaveBeenCalledWith(
        'Upload completed successfully! Uploaded 10 files.'
      )
    })

    it('should handle SSH connection failure', async () => {
      const mockSshInstance = {
        connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
        disconnect: jest.fn().mockResolvedValue(undefined)
      }
      MockSSHManager.mockImplementation(() => mockSshInstance as any)

      await run()

      expect(mockCore.setFailed).toHaveBeenCalledWith('Connection failed')
      expect(mockCore.setOutput).toHaveBeenCalledWith('success', 'false')
      expect(mockCore.setOutput).toHaveBeenCalledWith(
        'error',
        'Connection failed'
      )
      expect(mockSshInstance.disconnect).toHaveBeenCalled()
    })

    it('should handle upload failure', async () => {
      const mockSshInstance = {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        testConnection: jest.fn().mockResolvedValue(true),
        getSftpClient: jest.fn()
      }
      MockSSHManager.mockImplementation(() => mockSshInstance as any)

      const mockUploaderInstance = {
        upload: jest.fn().mockResolvedValue({
          success: false,
          uploadedFiles: 5,
          errors: ['Upload error', 'Permission denied']
        })
      }
      MockFileUploader.mockImplementation(() => mockUploaderInstance as any)

      await run()

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        'Upload failed: Upload error, Permission denied'
      )
      expect(mockCore.setOutput).toHaveBeenCalledWith('success', 'false')
      expect(mockCore.setOutput).toHaveBeenCalledWith(
        'error',
        'Upload error, Permission denied'
      )
    })

    it('should handle missing required inputs', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        if (name === 'host') return '' // 缺少必需参数
        return 'test-value'
      })

      await run()

      expect(mockCore.setFailed).toHaveBeenCalledWith('Host cannot be empty')
      expect(mockCore.setOutput).toHaveBeenCalledWith('success', 'false')
    })

    it('should handle connection test failure', async () => {
      const mockSshInstance = {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        testConnection: jest.fn().mockResolvedValue(false) // 连接测试失败
      }
      MockSSHManager.mockImplementation(() => mockSshInstance as any)

      await run()

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        'SSH connection test failed'
      )
      expect(mockCore.setOutput).toHaveBeenCalledWith('success', 'false')
      expect(mockSshInstance.disconnect).toHaveBeenCalled()
    })
  })
})
