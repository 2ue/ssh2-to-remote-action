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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHManager = void 0;
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const core = __importStar(require("@actions/core"));
class SSHManager {
    constructor(config) {
        this.config = config;
        this.sftp = new ssh2_sftp_client_1.default('ssh2-to-remote-action');
    }
    async connect() {
        try {
            const connectionConfig = {
                host: this.config.host,
                port: this.config.port,
                username: this.config.username
            };
            // 密码或私钥认证
            if (this.config.password) {
                connectionConfig.password = this.config.password;
            }
            if (this.config.privateKey) {
                connectionConfig.privateKey = this.config.privateKey;
            }
            if (this.config.passphrase) {
                connectionConfig.passphrase = this.config.passphrase;
            }
            if (this.config.agent) {
                connectionConfig.agent = this.config.agent;
            }
            // 可选配置
            if (this.config.forceIPv4)
                connectionConfig.forceIPv4 = this.config.forceIPv4;
            if (this.config.forceIPv6)
                connectionConfig.forceIPv6 = this.config.forceIPv6;
            if (this.config.readyTimeout)
                connectionConfig.readyTimeout = this.config.readyTimeout;
            if (this.config.strictVendor)
                connectionConfig.strictVendor = this.config.strictVendor;
            if (this.config.debug)
                connectionConfig.debug = this.config.debug;
            if (this.config.retries)
                connectionConfig.retries = this.config.retries;
            if (this.config.retry_factor)
                connectionConfig.retry_factor = this.config.retry_factor;
            if (this.config.retry_minTimeout)
                connectionConfig.retry_minTimeout = this.config.retry_minTimeout;
            if (this.config.promiseLimit)
                connectionConfig.promiseLimit = this.config.promiseLimit;
            core.info(`Connecting to ${this.config.host}:${this.config.port}...`);
            await this.sftp.connect(connectionConfig);
            core.info('SSH connection established successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            core.error(`SSH connection failed: ${errorMessage}`);
            throw new Error(`Failed to connect to SSH server: ${errorMessage}`);
        }
    }
    async disconnect() {
        try {
            if (this.sftp) {
                await this.sftp.end();
                core.info('SSH connection closed');
            }
        }
        catch (error) {
            core.warning(`Error closing SSH connection: ${error}`);
        }
    }
    getSftpClient() {
        return this.sftp;
    }
    async testConnection() {
        try {
            await this.sftp.list('.');
            return true;
        }
        catch (error) {
            core.warning(`Connection test failed: ${error}`);
            return false;
        }
    }
}
exports.SSHManager = SSHManager;
//# sourceMappingURL=manager.js.map