const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

let ffmpegPath = null;
let ffprobePath = null;
let ffplayPath = null;

function getBaseDir() {
    return process.cwd();
}

function buscarBinarioEnCarpeta(carpetaBase, nombreBinario) {
    if (!carpetaBase || typeof carpetaBase !== 'string') {
        return null;
    }
    
    if (!fs.existsSync(carpetaBase)) {
        return null;
    }
    
    const extension = process.platform === 'win32' ? '.exe' : '';
    const nombreConExe = nombreBinario + extension;
    
    const posiblesRutas = [
        path.join(carpetaBase, nombreConExe),
        path.join(carpetaBase, 'bin', nombreConExe),
        path.join(carpetaBase, 'ffmpeg-static', nombreConExe),
        path.join(carpetaBase, 'ffmpeg', nombreConExe),
        path.join(carpetaBase, 'bin', 'ffmpeg', nombreConExe)
    ];
    
    for (const ruta of posiblesRutas) {
        if (fs.existsSync(ruta)) {
            return ruta;
        }
    }
    
    return null;
}

function setBinariosFromFolder(carpetaBase) {
    if (!carpetaBase || typeof carpetaBase !== 'string') {
        return false;
    }
    
    if (!fs.existsSync(carpetaBase)) {
        return false;
    }
    
    const mpegPath = buscarBinarioEnCarpeta(carpetaBase, 'ffmpeg');
    const probePath = buscarBinarioEnCarpeta(carpetaBase, 'ffprobe');
    const playPath = buscarBinarioEnCarpeta(carpetaBase, 'ffplay');
    
    if (mpegPath) {
        ffmpegPath = mpegPath;
    }
    
    if (probePath) {
        ffprobePath = probePath;
    }
    
    if (playPath) {
        ffplayPath = playPath;
    }
    
    return mpegPath !== null;
}

function detectSystemFFmpeg() {
    try {
        if (process.platform === 'win32') {
            const whereOutput = execSync('where ffmpeg', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            if (whereOutput) {
                const paths = whereOutput.trim().split('\r\n');
                return paths[0];
            }
        } else {
            const whichOutput = execSync('which ffmpeg', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            if (whichOutput) {
                return whichOutput.trim();
            }
        }
    } catch (e) {}
    return null;
}

function detectSystemFFprobe() {
    try {
        if (process.platform === 'win32') {
            const whereOutput = execSync('where ffprobe', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            if (whereOutput) {
                const paths = whereOutput.trim().split('\r\n');
                return paths[0];
            }
        } else {
            const whichOutput = execSync('which ffprobe', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            if (whichOutput) {
                return whichOutput.trim();
            }
        }
    } catch (e) {}
    return null;
}

function detectNodeModulesFFmpeg() {
    try {
        const baseDir = getBaseDir();
        const possiblePaths = [
            path.join(baseDir, 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
            path.join(baseDir, 'node_modules', 'ffmpeg-static', 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
            path.join(baseDir, 'node_modules', '@ffmpeg-installer', 'ffmpeg', 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
            path.join(baseDir, 'node_modules', 'ffmpeg-binaries', 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg')
        ];
        
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                return testPath;
            }
        }
    } catch (e) {}
    return null;
}

function detectNodeModulesFFprobe() {
    try {
        const baseDir = getBaseDir();
        const possiblePaths = [
            path.join(baseDir, 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'),
            path.join(baseDir, 'node_modules', 'ffmpeg-static', 'bin', process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe')
        ];
        
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                return testPath;
            }
        }
    } catch (e) {}
    return null;
}

function getFixedFFmpegPath() {
    const baseDir = getBaseDir();
    const fixedPath = path.join(baseDir, 'ffmpeg-static', 'ffmpeg.exe');
    
    if (fs.existsSync(fixedPath)) {
        return fixedPath;
    }
    return null;
}

function getFixedFFprobePath() {
    const baseDir = getBaseDir();
    const fixedPath = path.join(baseDir, 'ffmpeg-static', 'ffprobe.exe');
    
    if (fs.existsSync(fixedPath)) {
        return fixedPath;
    }
    return null;
}

function getFixedFFplayPath() {
    const baseDir = getBaseDir();
    const fixedPath = path.join(baseDir, 'ffmpeg-static', 'ffplay.exe');
    
    if (fs.existsSync(fixedPath)) {
        return fixedPath;
    }
    return null;
}

function getFFmpegPath(userFolderPath = null) {
    if (ffmpegPath && !userFolderPath) {
        return ffmpegPath;
    }
    
    if (userFolderPath && typeof userFolderPath === 'string') {
        if (setBinariosFromFolder(userFolderPath)) {
            return ffmpegPath;
        }
    }
    
    const systemPath = detectSystemFFmpeg();
    if (systemPath) {
        ffmpegPath = systemPath;
        return ffmpegPath;
    }
    
    const nodeModulesPath = detectNodeModulesFFmpeg();
    if (nodeModulesPath) {
        ffmpegPath = nodeModulesPath;
        return ffmpegPath;
    }
    
    const fixedPath = getFixedFFmpegPath();
    if (fixedPath) {
        ffmpegPath = fixedPath;
        return ffmpegPath;
    }
    
    throw new Error('FFmpeg no encontrado');
}

function getFFprobePath(userFolderPath = null) {
    if (ffprobePath && !userFolderPath) {
        return ffprobePath;
    }
    
    if (userFolderPath && typeof userFolderPath === 'string') {
        setBinariosFromFolder(userFolderPath);
        if (ffprobePath) {
            return ffprobePath;
        }
    }
    
    const systemPath = detectSystemFFprobe();
    if (systemPath) {
        ffprobePath = systemPath;
        return ffprobePath;
    }
    
    const nodeModulesPath = detectNodeModulesFFprobe();
    if (nodeModulesPath) {
        ffprobePath = nodeModulesPath;
        return ffprobePath;
    }
    
    const fixedPath = getFixedFFprobePath();
    if (fixedPath) {
        ffprobePath = fixedPath;
        return ffprobePath;
    }
    
    return null;
}

function getFFplayPath(userFolderPath = null) {
    if (ffplayPath && !userFolderPath) {
        return ffplayPath;
    }
    
    if (userFolderPath && typeof userFolderPath === 'string') {
        setBinariosFromFolder(userFolderPath);
        if (ffplayPath) {
            return ffplayPath;
        }
    }
    
    const fixedPath = getFixedFFplayPath();
    if (fixedPath) {
        ffplayPath = fixedPath;
        return ffplayPath;
    }
    
    return null;
}

function resetBinarios() {
    ffmpegPath = null;
    ffprobePath = null;
    ffplayPath = null;
}

module.exports = {
    getFFmpegPath,
    getFFprobePath,
    getFFplayPath,
    setBinariosFromFolder,
    resetBinarios
};