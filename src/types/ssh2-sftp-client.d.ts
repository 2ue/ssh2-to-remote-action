declare module 'ssh2-sftp-client' {
  export default class SSH2SftpClient {
    constructor(name?: string)

    connect(config: any): Promise<void>
    end(): Promise<void>
    list(path: string): Promise<any[]>
    exists(path: string): Promise<boolean | string>
    mkdir(path: string, recursive?: boolean): Promise<void>
    uploadDir(
      localPath: string,
      remotePath: string,
      options?: {
        filter?: (localPath: string, isDirectory: boolean) => boolean
      }
    ): Promise<void>
    rcopy(src: string, dest: string): Promise<void>
  }
}
