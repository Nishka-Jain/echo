// audioWorker.js
// This worker receives raw audio data and converts it to MP3 using ffmpeg.wasm

self.importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.12.4/dist/ffmpeg.min.js');

let ffmpeg;

self.onmessage = async function (e) {
  const { audioBuffer, mimeType } = e.data;
  if (!ffmpeg) {
    ffmpeg = FFmpeg.createFFmpeg({ log: false });
    await ffmpeg.load();
  }
  // Write the input file
  ffmpeg.FS('writeFile', 'input.wav', new Uint8Array(audioBuffer));
  // Run conversion
  await ffmpeg.run('-i', 'input.wav', 'output.mp3');
  // Read the output file
  const mp3Data = ffmpeg.FS('readFile', 'output.mp3');
  // Send back the result
  self.postMessage({ mp3Buffer: mp3Data.buffer }, [mp3Data.buffer]);
};
