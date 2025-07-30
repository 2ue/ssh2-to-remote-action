import { SSHManager } from '../ssh/manager';
import { UploadConfig, UploadResult } from '../types';
export declare class FileUploader {
    private sshManager;
    private config;
    constructor(sshManager: SSHManager, config: UploadConfig);
    upload(): Promise<UploadResult>;
    private validateLocalDirectory;
    private backupRemoteDirectory;
}
