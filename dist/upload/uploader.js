"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploader = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class FileUploader {
    constructor(sshManager, config) {
        this.sshManager = sshManager;
        this.config = config;
    }
    async upload() {
        const errors = [];
        let uploadedFiles = 0;
        try {
            // 检查本地目录是否存在
            await this.validateLocalDirectory();
            // 备份远程目录（如果指定）
            if (this.config.remoteBakPath) {
                await this.backupRemoteDirectory();
            }
            // 上传文件
            core.info(`Starting upload: ${this.config.localDir} => ${this.config.remoteBaseDir}`);
            const sftp = this.sshManager.getSftpClient();
            // 使用 uploadDir 方法上传整个目录
            await sftp.uploadDir(this.config.localDir, this.config.remoteBaseDir, {
                filter: (localPath, isDirectory) => {
                    core.info(`Processing: ${localPath} ${isDirectory ? '(directory)' : '(file)'}`);
                    if (!isDirectory) {
                        uploadedFiles++;
                    }
                    return true;
                }
            });
            core.info(`Successfully uploaded ${uploadedFiles} files to ${this.config.remoteBaseDir}`);
            return {
                success: true,
                uploadedFiles,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            core.error(`Upload failed: ${errorMessage}`);
            errors.push(errorMessage);
            return {
                success: false,
                uploadedFiles,
                errors
            };
        }
    }
    async validateLocalDirectory() {
        try {
            const stats = await fs.stat(this.config.localDir);
            if (!stats.isDirectory()) {
                throw new Error(`Local path is not a directory: ${this.config.localDir}`);
            }
            core.info(`Local directory validated: ${this.config.localDir}`);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Local directory does not exist: ${this.config.localDir}`);
            }
            throw error;
        }
    }
    async backupRemoteDirectory() {
        try {
            const sftp = this.sshManager.getSftpClient();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.posix.join(this.config.remoteBakPath, `backup-${timestamp}`);
            core.info(`Creating backup: ${this.config.remoteBaseDir} => ${backupPath}`);
            // 检查远程目录是否存在
            const exists = await sftp.exists(this.config.remoteBaseDir);
            if (exists) {
                // 创建备份目录
                await sftp.mkdir(this.config.remoteBakPath, true);
                // 复制文件
                await sftp.rcopy(this.config.remoteBaseDir, backupPath);
                core.info(`Backup created successfully at: ${backupPath}`);
            }
            else {
                core.info('Remote directory does not exist, skipping backup');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            core.warning(`Backup failed: ${errorMessage}`);
            // 备份失败不应该阻止上传进程
        }
    }
}
exports.FileUploader = FileUploader;
//# sourceMappingURL=uploader.js.map