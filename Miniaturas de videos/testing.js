const { generarMiniaturaConFFmpeg } = require('./MiniaturaConFFmpeg');
const fs = require('fs');
const path = require('path');

let rutaFFmpeg = 'C:/ffmpeg-static/';

async function testMultiples() {
    // Lista de videos a probar
    const videos = [
        'C:/Users/Piñirí/Videos/ANIMACION/The Squid Girl - S01E06.mkv',
        'C:/Users/Piñirí/Videos/ANIMACION/REZZ _ Virtual Riot - Give in to you (feat-1. One True God) (Official Music Video)(720P_HD) - copia.mp4',
        'C:/Users/Piñirí/Videos/ANIMACION/GOAT [La Cabra Que Cambió El Juego] [2026] [4K-UHD HDR10] [Dual A].avi'
    ];
    
    const resultados = [];
    
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        console.log('\n[' + (i+1) + '] Probando:', video);
        
        const item = {
            index: i + 1,
            videoPath: video,
            success: false,
            thumbnailUrl: null,
            tiempoMs: null,
            error: null
        };
        
        if (!fs.existsSync(video)) {
            console.log('  Archivo no existe');
            item.error = 'Archivo no existe';
            resultados.push(item);
            continue;
        }
        
        const inicio = Date.now();
        const resultado = await generarMiniaturaConFFmpeg(video, rutaFFmpeg);
        const tiempo = Date.now() - inicio;
        
        if (resultado) {
            console.log('  OK - Tiempo: ' + tiempo + 'ms');
            console.log('  URL: ' + resultado);
            item.success = true;
            item.thumbnailUrl = resultado;
            item.tiempoMs = tiempo;
        } else {
            console.log('  FAIL');
            item.error = 'No se pudo generar miniatura';
        }
        
        resultados.push(item);
    }
    
    // Guardar JSON
    const jsonOutput = {
        fecha: new Date().toISOString(),
        totalVideos: videos.length,
        exitosos: resultados.filter(r => r.success).length,
        fallidos: resultados.filter(r => !r.success).length,
        resultados: resultados
    };
    
    const jsonPath = path.join(__dirname, 'resultados_miniaturas.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
    
    console.log('\n========================================');
    console.log('JSON guardado en: ' + jsonPath);
    console.log('Exitosos: ' + jsonOutput.exitosos + '/' + jsonOutput.totalVideos);
    console.log('========================================');
}

setTimeout(async () => {
  await testMultiples();
}, 200);
