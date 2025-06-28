"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, Check, RotateCcw, FastForward, Scissors, X } from 'lucide-react';

// A helper function to convert an AudioBuffer to a WAV Blob
const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * numChannels * bytesPerSample;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = buffer.getChannelData(channel)[i];
            const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }
    }
    return new Blob([arrayBuffer], { type: 'audio/wav' });
};

export default function AudioRecorder({ onRecordingComplete }) {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const recordPluginRef = useRef(null);
    const regionsPluginRef = useRef(null);
    const activeRegionRef = useRef(null);
    const currentAudioUrlRef = useRef(null);

    const [status, setStatus] = useState('loading'); // loading, idle, recording, paused, finished, trimming
    const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [finalAudioFile, setFinalAudioFile] = useState(null);
    const [isWaveSurferReady, setIsWaveSurferReady] = useState(false);

    // Load WaveSurfer scripts from CDN
    useEffect(() => {
        if (window.WaveSurfer && window.WaveSurfer.Record && window.WaveSurfer.Regions) {
            setIsWaveSurferReady(true);
            return;
        }
        const loadScript = (src) => new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
        loadScript('https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js')
            .then(() => Promise.all([
                loadScript('https://unpkg.com/wavesurfer.js@7/dist/plugins/record.min.js'),
                loadScript('https://unpkg.com/wavesurfer.js@7/dist/plugins/regions.min.js'),
            ]))
            .then(() => setIsWaveSurferReady(true))
            .catch(error => {
                console.error("Failed to load WaveSurfer scripts:", error);
                setStatus('error');
            });
    }, []);

    // Setup WaveSurfer instance once the library is ready
    useEffect(() => {
        if (!isWaveSurferReady || !waveformRef.current) return;
        
        const wavesurfer = window.WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#d1d5db',
            progressColor: '#374151',
            barWidth: 3, barGap: 2, barRadius: 2,
            height: 128,
        });
        wavesurferRef.current = wavesurfer;
        const record = wavesurfer.registerPlugin(window.WaveSurfer.Record.create());
        recordPluginRef.current = record;

        record.on('record-start', () => {
            setStatus('recording');
            setFinalAudioFile(null);
        });
        record.on('record-end', (blob) => {
            const url = URL.createObjectURL(blob);
            if (currentAudioUrlRef.current) URL.revokeObjectURL(currentAudioUrlRef.current);
            currentAudioUrlRef.current = url;
            wavesurfer.load(url);
            setRecordedBlob(blob);
            setStatus('finished');
        });

        wavesurfer.on('play', () => setIsPlaybackPlaying(true));
        wavesurfer.on('pause', () => setIsPlaybackPlaying(false));
        wavesurfer.on('finish', () => setIsPlaybackPlaying(false));
        
        setStatus('idle');

        return () => {
            if (currentAudioUrlRef.current) URL.revokeObjectURL(currentAudioUrlRef.current);
            wavesurfer.destroy();
        };
    }, [isWaveSurferReady]);

    // --- Controls ---
    const handleStartRecording = () => {
        if (recordPluginRef.current) {
            if (wavesurferRef.current.getDuration() > 0) wavesurferRef.current.empty();
            recordPluginRef.current.startRecording();
        }
    };
    const handleStopRecording = () => recordPluginRef.current?.stopRecording();
    const handlePauseRecording = () => {
        if (recordPluginRef.current?.isRecording()) {
            recordPluginRef.current.pauseRecording();
            setStatus('paused');
        }
    };
    const handleResumeRecording = () => {
        if (recordPluginRef.current?.isPaused()) {
            recordPluginRef.current.resumeRecording();
            setStatus('recording');
        }
    };

    const handleTogglePlayback = () => {
        if (!wavesurferRef.current) return;

        if (wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.pause();
            return;
        }

        if (status === 'trimming' && activeRegionRef.current) {
            activeRegionRef.current.play();
        } else {
            wavesurferRef.current.play();
        }
    };

    const handleChangePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        wavesurferRef.current?.setPlaybackRate(rate, true);
    };

    const handleEnableTrimming = () => {
        if (!window.WaveSurfer.Regions || !wavesurferRef.current) return;
        setStatus('trimming');
        if (regionsPluginRef.current) regionsPluginRef.current.destroy();
        
        const regions = wavesurferRef.current.registerPlugin(window.WaveSurfer.Regions.create());
        regionsPluginRef.current = regions;
        
        // This listener is key: it stops playback when the cursor leaves the region.
        regions.on('region-out', () => {
            if (wavesurferRef.current.isPlaying()) {
                wavesurferRef.current.pause();
            }
        });
        
        activeRegionRef.current = regions.addRegion({
            start: 0,
            end: wavesurferRef.current.getDuration(),
            color: 'rgba(59, 130, 246, 0.2)',
            drag: true,
            resize: true,
        });
    };

    const handleTrimAndSave = async () => {
        if (!activeRegionRef.current || !recordedBlob) return;
        const { start, end } = activeRegionRef.current;
        const originalBuffer = wavesurferRef.current.getDecodedData();
        if (!originalBuffer || end - start <= 0) return;

        const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        const offlineContext = new OfflineAudioContext(
            originalBuffer.numberOfChannels,
            (end - start) * originalBuffer.sampleRate,
            originalBuffer.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = originalBuffer;
        source.connect(offlineContext.destination);
        source.start(0, start, end - start);

        const newBuffer = await offlineContext.startRendering();
        const newBlob = audioBufferToWav(newBuffer);
        
        const newUrl = URL.createObjectURL(newBlob);
        if (currentAudioUrlRef.current) URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = newUrl;
        
        wavesurferRef.current.once('ready', () => {
            setRecordedBlob(newBlob);
            handleCancelTrimming();
        });
        wavesurferRef.current.load(newUrl);
    };

    const handleCancelTrimming = () => {
        if (regionsPluginRef.current) {
            regionsPluginRef.current.destroy();
            regionsPluginRef.current = null;
        }
        activeRegionRef.current = null;
        setStatus('finished');
    };

    const handleConfirm = () => {
        if (!recordedBlob) return;
        const file = new File([recordedBlob], `echo-recording-${Date.now()}.wav`, { type: 'audio/wav' });
        setFinalAudioFile(file);
        if (onRecordingComplete) onRecordingComplete(file);
    };

    const handleRestart = () => {
        handleCancelTrimming();
        wavesurferRef.current?.empty();
        setStatus('idle');
        setFinalAudioFile(null);
        setRecordedBlob(null);
        if (onRecordingComplete) onRecordingComplete(null);
    };

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto space-y-4">
            <div ref={waveformRef} id="waveform" className="w-full h-32 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50 transition-all"></div>
            
            {status === 'loading' && <p className="text-center text-stone-500">Loading audio editor...</p>}
            {status === 'error' && <p className="text-center text-red-500">Error loading editor. Please refresh.</p>}

            <div className="flex items-center justify-center gap-4 flex-wrap">
                {status === 'idle' && (
                    <button onClick={handleStartRecording} className="flex items-center gap-2 p-4 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow-md">
                        <Mic size={20} /> Start Recording
                    </button>
                )}
                {(status === 'recording' || status === 'paused') && (
                    <>
                        <button onClick={status === 'recording' ? handlePauseRecording : handleResumeRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-700 text-white hover:bg-stone-800 transition-colors font-semibold">
                            {status === 'recording' ? <Pause size={20} /> : <Play size={20} />} {status === 'recording' ? 'Pause' : 'Resume'}
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
                        <button onClick={handleConfirm} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold">
                            <Check size={20} /> Confirm
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
                        <button onClick={handleCancelTrimming} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors font-semibold">
                           <X size={20} /> Cancel
                        </button>
                    </>
                )}
            </div>

            {wavesurferRef.current && wavesurferRef.current.getDuration() > 0 && (
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-stone-200 mt-4">
                    <button onClick={handleTogglePlayback} className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors disabled:opacity-50" disabled={status === 'recording'}>
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
