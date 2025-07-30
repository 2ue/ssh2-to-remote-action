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
exports.getActionInputs = getActionInputs;
const core = __importStar(require("@actions/core"));
function getActionInputs() {
    const host = core.getInput('host', { required: true });
    const port = parseInt(core.getInput('port') || '22', 10);
    const username = core.getInput('username', { required: true });
    const password = core.getInput('password');
    const privateKey = core.getInput('privateKey');
    const passphrase = core.getInput('passphrase');
    const agent = core.getInput('agent');
    const localDir = core.getInput('local_dir', { required: true });
    const remoteBaseDir = core.getInput('remote_base_dir', { required: true });
    const remoteBakPath = core.getInput('remote_bak_path');
    // 可选参数
    const forceIPv4 = core.getBooleanInput('forceIPv4');
    const forceIPv6 = core.getBooleanInput('forceIPv6');
    const readyTimeout = parseInt(core.getInput('readyTimeout') || '20000', 10);
    const strictVendor = core.getBooleanInput('strictVendor');
    const debug = core.getBooleanInput('debug');
    const retries = parseInt(core.getInput('retries') || '1', 10);
    const retry_factor = parseFloat(core.getInput('retry_factor') || '2');
    const retry_minTimeout = parseInt(core.getInput('retry_minTimeout') || '1000', 10);
    const promiseLimit = parseInt(core.getInput('promiseLimit') || '10', 10);
    // 验证输入
    if (!host.trim()) {
        throw new Error('Host cannot be empty');
    }
    if (port < 1 || port > 65535) {
        throw new Error('Port must be between 1 and 65535');
    }
    if (!username.trim()) {
        throw new Error('Username cannot be empty');
    }
    if (!password && !privateKey) {
        throw new Error('Either password or privateKey must be provided');
    }
    if (!localDir.trim()) {
        throw new Error('Local directory cannot be empty');
    }
    if (!remoteBaseDir.trim()) {
        throw new Error('Remote base directory cannot be empty');
    }
    return {
        host: host.trim(),
        port,
        username: username.trim(),
        password: password || undefined,
        privateKey: privateKey || undefined,
        passphrase: passphrase || undefined,
        agent: agent || undefined,
        forceIPv4,
        forceIPv6,
        readyTimeout,
        strictVendor,
        debug,
        retries,
        retry_factor,
        retry_minTimeout,
        promiseLimit,
        localDir: localDir.trim(),
        remoteBaseDir: remoteBaseDir.trim(),
        remoteBakPath: remoteBakPath?.trim() || undefined
    };
}
//# sourceMappingURL=inputs.js.map