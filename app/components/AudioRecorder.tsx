// app/components/AudioRecorder.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Mic, Square, Pause, Play, Check, Scissors, RotateCcw, FastForward } from 'lucide-react';

export default function AudioRecorder({ onRecordingComplete }) {
    // Refs to hold instances of wavesurfer and its plugins
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const recordPluginRef = useRef(null);
    const regionsPluginRef = useRef(null);
    const activeRegionRef = useRef(null);
    
    // State for the component's current status
    // idle, recording, paused, finished, trimming
    const [status, setStatus] = useState('idle');
    
    // State for playback controls
    const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    
    // State to hold the final, trimmed audio for submission
    const [finalAudioFile, setFinalAudioFile] = useState(null);

    // Main setup effect, runs only once
    useEffect(() => {
        if (!waveformRef.current) return;

        // Create WaveSurfer instance
        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#d1d5db', // gray-300
            progressColor: '#374151', // gray-700
            barWidth: 3,
            barGap: 2,
            barRadius: 2,
            height: 128, // Increased height for better visualization
        });
        wavesurferRef.current = wavesurfer;

        // Register and store the Record plugin instance
        const record = wavesurfer.registerPlugin(RecordPlugin.create());
        recordPluginRef.current = record;

        // Event listeners for the Record plugin
        record.on('record-start', () => {
            setStatus('recording');
            setFinalAudioFile(null);
            if (activeRegionRef.current) {
                activeRegionRef.current.remove();
                activeRegionRef.current = null;
            }
        });

        record.on('record-end', (blob) => {
            const url = URL.createObjectURL(blob);
            wavesurfer.load(url);
            setStatus('finished');
        });
        
        // Event listeners for WaveSurfer playback
        wavesurfer.on('play', () => setIsPlaybackPlaying(true));
        wavesurfer.on('pause', () => setIsPlaybackPlaying(false));
        wavesurfer.on('finish', () => setIsPlaybackPlaying(false));

        // Cleanup on unmount
        return () => {
            record.destroy();
            wavesurfer.destroy();
        };
    }, []);

    // --- RECORDING HANDLERS ---
    const handleStartRecording = () => {
        recordPluginRef.current.startRecording();
    };
    
    const handleStopRecording = () => {
        recordPluginRef.current.stopRecording();
    };

    const handlePauseRecording = () => {
        if (recordPluginRef.current.isRecording()) {
            recordPluginRef.current.pauseRecording();
            setStatus('paused');
        }
    };
    
    const handleResumeRecording = () => {
        if (recordPluginRef.current.isPaused()) {
            recordPluginRef.current.resumeRecording();
            setStatus('recording');
        }
    };

    // --- PLAYBACK HANDLERS ---
    const handleTogglePlayback = () => {
        if (wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.pause();
        } else {
            wavesurferRef.current.play();
        }
    };
    
    const handleChangePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        wavesurferRef.current.setPlaybackRate(rate, true);
    };

    // --- TRIMMING HANDLERS ---
    const handleEnableTrimming = () => {
        setStatus('trimming');
        const regions = wavesurferRef.current.registerPlugin(RegionsPlugin.create());
        regionsPluginRef.current = regions;
        
        regions.once('ready', () => {
            if (activeRegionRef.current) activeRegionRef.current.remove();
            const newRegion = regions.addRegion({
                start: 0,
                end: wavesurferRef.current.getDuration(),
                color: 'rgba(59, 130, 246, 0.2)', // blue-500 with opacity
                drag: true,
                resize: true,
            });
            activeRegionRef.current = newRegion;
        });
    };

    const handleTrimAndSave = async () => {
        if (!activeRegionRef.current) return;
        
        const ws = wavesurferRef.current;
        const start = activeRegionRef.current.start;
        const end = activeRegionRef.current.end;

        const originalBuffer = ws.getDecodedData();
        if (!originalBuffer) return;

        const newBuffer = ws.backend.ac.createBuffer(
            originalBuffer.numberOfChannels,
            (end - start) * originalBuffer.sampleRate,
            originalBuffer.sampleRate,
        );

        for (let i = 0; i < originalBuffer.numberOfChannels; i++) {
            const chanData = originalBuffer.getChannelData(i);
            const segment = chanData.slice(
                Math.floor(start * originalBuffer.sampleRate),
                Math.floor(end * originalBuffer.sampleRate),
            );
            newBuffer.getChannelData(i).set(segment);
        }

        const blob = await bufferToWavBlob(newBuffer);
        const file = new File([blob], `echo-trimmed-${Date.now()}.wav`, { type: 'audio/wav' });
        
        setFinalAudioFile(file);
        onRecordingComplete(file);
        setStatus('finished'); // Go back to finished state to see the result
        
        // Load the new trimmed audio into wavesurfer for final playback
        const url = URL.createObjectURL(file);
        ws.load(url);
        
        if (regionsPluginRef.current) {
            regionsPluginRef.current.destroy();
            regionsPluginRef.current = null;
        }
    };
    
    // --- UTILITY ---
    const bufferToWavBlob = (buffer) => {
        return new Promise((resolve) => {
            const worker = new Worker(URL.createObjectURL(new Blob([`
                const encodeWAV = (samples, format, sampleRate, numChannels, bitDepth) => {
                    const blockAlign = (numChannels * bitDepth) / 8;
                    const byteRate = sampleRate * blockAlign;
                    const dataSize = samples.length * (bitDepth / 8);
                    const buffer = new ArrayBuffer(44 + dataSize);
                    const view = new DataView(buffer);
                    // RIFF header
                    view.setUint8(0, 'R'.charCodeAt(0)); view.setUint8(1, 'I'.charCodeAt(0)); view.setUint8(2, 'F'.charCodeAt(0)); view.setUint8(3, 'F'.charCodeAt(0));
                    view.setUint32(4, 36 + dataSize, true);
                    // WAVE header
                    view.setUint8(8, 'W'.charCodeAt(0)); view.setUint8(9, 'A'.charCodeAt(0)); view.setUint8(10, 'V'.charCodeAt(0)); view.setUint8(11, 'E'.charCodeAt(0));
                    // fmt chunk
                    view.setUint8(12, 'f'.charCodeAt(0)); view.setUint8(13, 'm'.charCodeAt(0)); view.setUint8(14, 't'.charCodeAt(0)); view.setUint8(15, ' '.charCodeAt(0));
                    view.setUint32(16, 16, true);
                    view.setUint16(20, format, true);
                    view.setUint16(22, numChannels, true);
                    view.setUint32(24, sampleRate, true);
                    view.setUint32(28, byteRate, true);
                    view.setUint16(32, blockAlign, true);
                    view.setUint16(34, bitDepth, true);
                    // data chunk
                    view.setUint8(36, 'd'.charCodeAt(0)); view.setUint8(37, 'a'.charCodeAt(0)); view.setUint8(38, 't'.charCodeAt(0)); view.setUint8(39, 'a'.charCodeAt(0));
                    view.setUint32(40, dataSize, true);

                    let offset = 44;
                    for (let i = 0; i < samples.length; i++, offset += 2) {
                        const s = Math.max(-1, Math.min(1, samples[i]));
                        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
                    }
                    return new Blob([view], { type: 'audio/wav' });
                };
                self.onmessage = (e) => {
                    const wav = encodeWAV(e.data.samples, 1, e.data.sampleRate, 1, 16);
                    self.postMessage(wav);
                };
            `], { type: 'application/javascript' })));

            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            
            const channelData = buffer.getChannelData(0);
            worker.postMessage({ samples: channelData, sampleRate: buffer.sampleRate });
        });
    };
    
    const handleRestart = () => {
        wavesurferRef.current.empty();
        if (regionsPluginRef.current) {
            regionsPluginRef.current.destroy();
            regionsPluginRef.current = null;
        }
        setStatus('idle');
        setFinalAudioFile(null);
        onRecordingComplete(null);
    };

    return (
        <div className="space-y-4">
            <div ref={waveformRef} id="waveform" className="w-full h-32 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50 transition-all"></div>
            
            {/* --- Buttons based on status --- */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
                {status === 'idle' && (
                    <button onClick={handleStartRecording} className="flex items-center gap-2 p-4 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold">
                        <Mic size={20} /> Start Recording
                    </button>
                )}

                {status === 'recording' && (
                    <>
                        <button onClick={handlePauseRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-700 text-white hover:bg-stone-800 transition-colors font-semibold">
                            <Pause size={20} /> Pause
                        </button>
                        <button onClick={handleStopRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold">
                            <Square size={20} /> Stop
                        </button>
                    </>
                )}

                {status === 'paused' && (
                     <>
                        <button onClick={handleResumeRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-700 text-white hover:bg-stone-800 transition-colors font-semibold">
                            <Play size={20} /> Resume
                        </button>
                        <button onClick={handleStopRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold">
                            <Square size={20} /> Stop
                        </button>
                    </>
                )}

                {status === 'finished' && (
                    <>
                        <button onClick={handleEnableTrimming} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">
                            <Scissors size={20} /> Trim Clip
                        </button>
                        <button onClick={handleRestart} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors font-semibold">
                            <RotateCcw size={20} /> Record Again
                        </button>
                    </>
                )}
                
                {status === 'trimming' && (
                    <>
                        <button onClick={handleTrimAndSave} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold">
                            <Check size={20} /> Confirm Trim
                        </button>
                        <button onClick={handleRestart} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors font-semibold">
                            <RotateCcw size={20} /> Cancel
                        </button>
                    </>
                )}
            </div>

            {/* --- Playback Controls (only show when a clip is loaded) --- */}
            {wavesurferRef.current && wavesurferRef.current.getDuration() > 0 && (
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-stone-200 mt-4">
                    <button onClick={handleTogglePlayback} className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors">
                        {isPlaybackPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                        <FastForward size={16} />
                        <span>Speed:</span>
                        {[0.5, 1, 1.5, 2].map(rate => (
                            <button key={rate} onClick={() => handleChangePlaybackRate(rate)} className={`px-3 py-1 rounded-full text-xs font-semibold ${playbackRate === rate ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}>
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {finalAudioFile && (
                <div className="mt-4 p-3 text-center bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center justify-center gap-3 text-sm">
                    <Check size={20} />
                    <span>Ready to submit: <strong>{finalAudioFile.name}</strong></span>
                </div>
            )}
        </div>
    );
}
