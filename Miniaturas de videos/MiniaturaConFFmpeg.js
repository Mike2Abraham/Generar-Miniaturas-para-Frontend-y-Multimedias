// Módulos requeridos dentro de la función
const path = require('path');
const crypto = require('crypto');
const fs = require("fs");
const fsCache = require('fs').promises;
const os = require('os');

//Funciones internas que usa el codigo
const { CargarThumbCache, SalvarThumbCache, GenerarThumbHash, NormalizarToFileUrl } = require('./funcionesInternas');

//Resuelve la ruta del binario de ffmpeg
const { getFFmpegPath, getFFprobePath, getFFplayPath, setBinariosFromFolder, resetBinarios } = require('./ResolverPathffmpeg') // configura la ruta del ffmpeg

// Configuración
const THUMB_CACHE_FILE = path.join(os.tmpdir(), 'video_thumbs_cache_piniri.json');


async function generarMiniaturaConFFmpeg(rutaVideo, ffmpegFolderPath = null) {    
    try {
        // Verificar que el archivo existe
        if (!rutaVideo || typeof rutaVideo !== 'string') {
            return null;
        }
        
        const fs = require('fs');
        if (!fs.existsSync(rutaVideo)) {
            console.log(`[CACHE] Archivo no existe: ${rutaVideo}`);
            return null;
        }
        
        // Obtener mtime del archivo
        const stats = await fsCache.stat(rutaVideo);
        const mtime = stats.mtimeMs;
        
        // Generar hash único
        const hash = GenerarThumbHash(rutaVideo, mtime);
        
        // Cargar caché
        const cache = await CargarThumbCache();
        
        // Verificar si ya tenemos esta miniatura
        if (cache[hash] && cache[hash].thumbPath) {
            const thumbPath = cache[hash].thumbPath;
            
            // Verificar que el archivo temporal aún existe
            try {
                await fsCache.access(thumbPath);
                
                // Retornar file:// URL en lugar de base64
                return NormalizarToFileUrl(thumbPath);
                
            } catch (err) {
                // Archivo temporal perdido, eliminamos entrada
                console.log(`[CACHE] Archivo temporal perdido: ${thumbPath}`);
                delete cache[hash];
                await SalvarThumbCache(cache);
            }
        }
        
        // No está en caché, generamos nueva miniatura
        const tempFile = path.join(os.tmpdir(), `thumb_${Date.now()}_${hash.substring(0, 8)}.jpg`);
        
        let ffmpegBinary;
        try {
            ffmpegBinary = getFFmpegPath(ffmpegFolderPath);
        } catch (error) {
            console.error('[FFmpeg] Error obteniendo ffmpeg:', error.message);
            return null;
        }

        // Usar FFmpeg
        const { spawn } = require('child_process');
        const ffmpeg = spawn(ffmpegBinary, [
            '-ss', '00:00:05',
            '-i', rutaVideo,
            '-vframes', '1',
            '-q:v', '2',
            '-vf', 'scale=500:-1',
            '-y',
            tempFile
        ]);
        
        return new Promise((resolve) => {
            ffmpeg.on('close', async (code) => {
                const fsSync = require('fs');
                
                if (code === 0 && fsSync.existsSync(tempFile)) {
                    try {
                        // Guardar en caché
                        cache[hash] = {
                            thumbPath: tempFile,
                            createdAt: Date.now()
                        };
                        await SalvarThumbCache(cache);
                        
                        // Retornar file:// URL en lugar de base64
                        resolve(NormalizarToFileUrl(tempFile));
                        
                    } catch (err) {
                        console.error('[CACHE] Error leyendo miniatura generada:', err.message);
                        resolve(null);
                    }
                } else {
                    console.error(`[CACHE] FFmpeg falló con código ${code}`);
                    resolve(null);
                }
            });
            
            ffmpeg.on('error', (error) => {
                console.error('[CACHE] Error ejecutando FFmpeg:', error.message);
                resolve(null);
            });
            
            // Timeout
            setTimeout(() => {
                try { ffmpeg.kill(); } catch(e) {}
                resolve(null);
            }, 10000);
        });
        
    } catch (error) {
        console.error('[CACHE] Error general:', error.message);
        return null;
    }
}

module.exports = {
    generarMiniaturaConFFmpeg
};