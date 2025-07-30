import SSH2SftpClient from 'ssh2-sftp-client';
import { SSHConfig } from '../types';
export declare class SSHManager {
    private sftp;
    private config;
    constructor(config: SSHConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getSftpClient(): SSH2SftpClient;
    testConnection(): Promise<boolean>;
}
