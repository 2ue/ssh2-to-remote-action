export interface SSHConfig {
    host: string;
    port: number;
    username: string;
    password?: string;
    privateKey?: string;
    passphrase?: string;
    agent?: string;
    forceIPv4?: boolean;
    forceIPv6?: boolean;
    readyTimeout?: number;
    strictVendor?: boolean;
    debug?: boolean;
    retries?: number;
    retry_factor?: number;
    retry_minTimeout?: number;
    promiseLimit?: number;
}
export interface UploadConfig {
    localDir: string;
    remoteBaseDir: string;
    remoteBakPath?: string;
}
export interface ActionInputs extends SSHConfig, UploadConfig {
}
export interface UploadResult {
    success: boolean;
    uploadedFiles: number;
    errors?: string[];
}
