const path = require('path');
const fs = require("fs");
const fsCache = require('fs').promises;
const crypto = require('crypto');
const os = require('os');  

// nombre del json
const THUMB_CACHE_FILE = path.join(os.tmpdir(), 'video_thumbs_cache_piniri.json');

// Funciones internas
async function CargarThumbCache() {
    try {
        const data = await fsCache.readFile(THUMB_CACHE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

async function SalvarThumbCache(cache) {
    try {
        await fsCache.writeFile(THUMB_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
    } catch (error) {
        console.log('Error guardando caché de miniaturas:', error.message);
    }
}

function GenerarThumbHash(filePath, mtime) {
    const hash = crypto.createHash('md5');
    hash.update(filePath);
    hash.update(String(mtime));
    return hash.digest('hex');
}

function NormalizarToFileUrl(filePath) {
    // Normalizar barras invertidas a barras normales
    let normalized = filePath.replace(/\\/g, '/');
    // Asegurar que comience con file://
    if (!normalized.startsWith('file://')) {
        normalized = 'file:///' + normalized;
    }
    return normalized;
}

module.exports = {
    CargarThumbCache,
    SalvarThumbCache,
    GenerarThumbHash,
    NormalizarToFileUrl
};