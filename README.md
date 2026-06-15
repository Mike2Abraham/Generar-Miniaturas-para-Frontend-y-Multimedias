# Generar-Miniaturas-para-Frontend-y-Multimedias
Generador de Miniaturas con FFmpeg ¿Qué problema resuelve? Extraer una imagen (miniatura) de un archivo de video sin tener que reproducirlo. Sirve para:  Mostrar vistas previas en galerías de videos  Crear thumbnails para reproductores  Generar previsualizaciones sin cargar el video completo



Generador de Miniaturas con FFmpeg
¿Qué problema resuelve?
Extraer una imagen (miniatura) de un archivo de video sin tener que reproducirlo. Sirve para:

Mostrar vistas previas en galerías de videos

Crear thumbnails para reproductores

Generar previsualizaciones sin cargar el video completo

¿Cómo funciona?
Usa FFmpeg para capturar un frame del video (segundo 5)

Escala la imagen a 500px de ancho manteniendo proporción

Guarda la miniatura como archivo JPG temporal

Retorna una URL file:// para usarla directamente en navegador o HTML

Sistema de caché
Cada video tiene un hash único basado en su ruta y fecha de modificación. Si ya se generó su miniatura antes, se reutiliza sin volver a procesar. Esto ahorra tiempo y recursos.

Detección automática de FFmpeg
Busca FFmpeg en este orden:

Carpeta proporcionada por el usuario

Instalado en el sistema (Windows/Linux/Mac)

Dentro de node_modules

Ruta fija local ffmpeg-static/ffmpeg.exe

Uso básico
javascript
const { generarMiniaturaConFFmpeg } = require('./MiniaturaConFFmpeg');

// Detección automática
const miniatura = await generarMiniaturaConFFmpeg('video.mp4');
// Retorna: file:///C:/temp/thumb_12345.jpg

// Especificando carpeta de FFmpeg
const miniatura = await generarMiniaturaConFFmpeg('video.mp4', 'C:/mis-binarios');
Ejemplo práctico
javascript
// Generar miniaturas para múltiples videos
const videos = ['video1.mp4', 'video2.mp4', 'video3.mp4'];

for (const video of videos) {
    const thumb = await generarMiniaturaConFFmpeg(video);
    if (thumb) {
        console.log(`Miniatura lista: ${thumb}`);
        // Usar en HTML: <img src="${thumb}">
    }
}
¿Por qué usarlo?
Rápido: caché evita reprocesar

Robusto: múltiples formas de encontrar FFmpeg

Simple: una función, un resultado

Portable: funciona en Windows, Linux y Mac
