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
exports.run = run;
const core = __importStar(require("@actions/core"));
const inputs_1 = require("./config/inputs");
const manager_1 = require("./ssh/manager");
const uploader_1 = require("./upload/uploader");
async function run() {
    let sshManager = null;
    try {
        core.info('SSH2 Remote Action starting...');
        // 获取输入参数
        const inputs = (0, inputs_1.getActionInputs)();
        core.info(`Connecting to ${inputs.host}:${inputs.port} as ${inputs.username}`);
        // 创建 SSH 连接
        sshManager = new manager_1.SSHManager(inputs);
        await sshManager.connect();
        // 测试连接
        const isConnected = await sshManager.testConnection();
        if (!isConnected) {
            throw new Error('SSH connection test failed');
        }
        // 创建文件上传器
        const uploader = new uploader_1.FileUploader(sshManager, {
            localDir: inputs.localDir,
            remoteBaseDir: inputs.remoteBaseDir,
            remoteBakPath: inputs.remoteBakPath
        });
        // 执行上传
        const result = await uploader.upload();
        if (result.success) {
            core.info(`Upload completed successfully! Uploaded ${result.uploadedFiles} files.`);
            core.setOutput('uploaded_files', result.uploadedFiles.toString());
            core.setOutput('success', 'true');
        }
        else {
            const errorMsg = result.errors?.join(', ') || 'Unknown error';
            core.setFailed(`Upload failed: ${errorMsg}`);
            core.setOutput('success', 'false');
            core.setOutput('error', errorMsg);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.error(`Action failed: ${errorMessage}`);
        core.setFailed(errorMessage);
        core.setOutput('success', 'false');
        core.setOutput('error', errorMessage);
    }
    finally {
        // 确保 SSH 连接被关闭
        if (sshManager) {
            await sshManager.disconnect();
        }
    }
}
// 如果直接运行此文件，则执行 run 函数
if (require.main === module) {
    run().catch(error => {
        core.error(`Unhandled error: ${error}`);
        process.exit(1);
    });
}
//# sourceMappingURL=main.js.map