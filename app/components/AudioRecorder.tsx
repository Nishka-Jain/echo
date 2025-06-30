"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, Check, RotateCcw, Scissors, X } from 'lucide-react';

// Define types for better code quality. These are placeholders for the actual WaveSurfer types.
// If you install @types/wavesurfer.js, you could get more specific types.
type WaveSurferInstance = any;
type RecordPluginInstance = any;
type RegionsPluginInstance = any;
type Region = any;

// Helper function to convert an AudioBuffer to a WAV Blob
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    // ... (The low-level audio conversion logic remains unchanged)
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
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
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

// Define props for our component
interface AudioRecorderProps {
    onRecordingComplete: (file: File | null) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
    const waveformRef = useRef<HTMLDivElement | null>(null);
    const wavesurferRef = useRef<WaveSurferInstance | null>(null);
    const recordPluginRef = useRef<RecordPluginInstance | null>(null);
    const regionsPluginRef = useRef<RegionsPluginInstance | null>(null);
    const activeRegionRef = useRef<Region | null>(null);
    const currentAudioUrlRef = useRef<string | null>(null);

    const [status, setStatus] = useState('loading'); // loading, idle, recording, paused, finished, trimming
    const [isPlaybackPlaying, setIsPlaybackPlaying] = useState<boolean>(false);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [finalAudioFile, setFinalAudioFile] = useState<File | null>(null);
    const [isWaveSurferReady, setIsWaveSurferReady] = useState<boolean>(false);

    // This effect handles the asynchronous loading of the WaveSurfer scripts from a CDN.
    useEffect(() => {
        // @ts-ignore
        if (window.WaveSurfer && window.WaveSurfer.Record && window.WaveSurfer.Regions) {
            setIsWaveSurferReady(true);
            return;
        }
        const loadScript = (src: string) => new Promise((resolve, reject) => {
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
        
        // @ts-ignore
        const wavesurfer = window.WaveSurfer.create({
            container: waveformRef.current, waveColor: '#d1d5db', progressColor: '#374151',
            barWidth: 3, barGap: 2, barRadius: 2, height: 128,
        });
        wavesurferRef.current = wavesurfer;
        // @ts-ignore
        const record = wavesurfer.registerPlugin(window.WaveSurfer.Record.create());
        recordPluginRef.current = record;

        record.on('record-start', () => { setStatus('recording'); setFinalAudioFile(null); });
        record.on('record-end', (blob: Blob) => {
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

    const handleStartRecording = () => {
        if (recordPluginRef.current) {
            if (wavesurferRef.current?.getDuration() > 0) wavesurferRef.current.empty();
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
        if (status === 'trimming' && activeRegionRef.current) {
            activeRegionRef.current.play();
        } else {
            wavesurferRef.current.playPause();
        }
    };
    const handleChangePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        wavesurferRef.current?.setPlaybackRate(rate, true);
    };
    const handleEnableTrimming = () => {
        // @ts-ignore
        if (!window.WaveSurfer.Regions || !wavesurferRef.current) return;
        setStatus('trimming');
        if (regionsPluginRef.current) regionsPluginRef.current.destroy();
        
        // @ts-ignore
        const regions = wavesurferRef.current.registerPlugin(window.WaveSurfer.Regions.create());
        regionsPluginRef.current = regions;
        
        regions.on('region-out', () => { if (wavesurferRef.current.isPlaying()) wavesurferRef.current.pause(); });
        
        activeRegionRef.current = regions.addRegion({
            start: 0, end: wavesurferRef.current.getDuration(), color: 'rgba(59, 130, 246, 0.2)',
            drag: true, resize: true,
        });
    };
    const handleTrimAndSave = async () => {
        if (!activeRegionRef.current || !recordedBlob) return;
        const { start, end } = activeRegionRef.current;
        const originalBuffer = wavesurferRef.current.getDecodedData();
        if (!originalBuffer || end - start <= 0) return;

        const OfflineAudioContext = window.OfflineAudioContext;
        const offlineContext = new OfflineAudioContext(originalBuffer.numberOfChannels, (end - start) * originalBuffer.sampleRate, originalBuffer.sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = originalBuffer;
        source.connect(offlineContext.destination);
        source.start(0, start, end - start);

        const newBuffer = await offlineContext.startRendering();
        const newBlob = audioBufferToWav(newBuffer);
        const newUrl = URL.createObjectURL(newBlob);
        if (currentAudioUrlRef.current) URL.revokeObjectURL(currentAudioUrlRef.current);
        currentAudioUrlRef.current = newUrl;
        
        wavesurferRef.current.load(newUrl);
        setRecordedBlob(newBlob);
        handleCancelTrimming();
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
        onRecordingComplete(file);
    };
    const handleRestart = () => {
        handleCancelTrimming();
        wavesurferRef.current?.empty();
        setStatus('idle');
        setFinalAudioFile(null);
        setRecordedBlob(null);
        onRecordingComplete(null);
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm w-full mx-auto space-y-4">
            <div ref={waveformRef} id="waveform" className="w-full h-32 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50 transition-all"></div>
            
            {status === 'loading' && <p className="text-center text-stone-500 py-12">Loading Audio Editor...</p>}
            {status === 'error' && <p className="text-center text-red-500 py-12">Error loading editor. Please refresh.</p>}

            <div className="flex items-center justify-center gap-4 flex-wrap min-h-[64px]">
                {status === 'idle' && (
                    <button type="button" onClick={handleStartRecording} className="flex items-center gap-2 p-4 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow-md">
                        <Mic size={20} /> Start Recording
                    </button>
                )}
                {(status === 'recording' || status === 'paused') && (
                    <>
                        <button type="button" onClick={status === 'recording' ? handlePauseRecording : handleResumeRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-stone-700 text-white hover:bg-stone-800 transition-colors font-semibold">
                            {status === 'recording' ? <Pause size={20} /> : <Play size={20} />} {status === 'recording' ? 'Pause' : 'Resume'}
                        </button>
                        <button type="button" onClick={handleStopRecording} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold">
                            <Square size={20} /> Stop
                        </button>
                    </>
                )}
                {status === 'finished' && (
                    <>
                        <button type="button" onClick={handleEnableTrimming} className="flex items-center gap-3 p-3 px-4 rounded-lg bg-stone-600 text-white hover:bg-stone-700 transition-colors font-medium">
                            <Scissors size={16} /> Trim
                        </button>
                        <button type="button" onClick={handleRestart} className="flex items-center gap-3 p-3 px-4 rounded-lg bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors font-medium">
                            <RotateCcw size={16} /> Re-record
                        </button>
                        <button type="button" onClick={handleConfirm} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold">
                            <Check size={20} /> Use This Recording
                        </button>
                    </>
                )}
                {status === 'trimming' && (
                    <>
                        <button type="button" onClick={handleCancelTrimming} className="flex items-center gap-3 p-3 px-4 rounded-lg bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors font-medium">
                           <X size={16} /> Cancel
                        </button>
                        <button type="button" onClick={handleTrimAndSave} className="flex items-center gap-3 p-4 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold">
                            <Check size={20} /> Save Trim
                        </button>
                    </>
                )}
            </div>

            {wavesurferRef.current?.getDuration() > 0 && (
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-stone-200 mt-4">
                    <button type="button" onClick={handleTogglePlayback} className="p-3 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors disabled:opacity-50" disabled={status === 'recording' || status === 'paused'}>
                        {isPlaybackPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                        <span>Speed:</span>
                        {[1, 1.5, 2].map(rate => (
                            <button type="button" key={rate} onClick={() => handleChangePlaybackRate(rate)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${playbackRate === rate ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}>
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {finalAudioFile && (
                <div className="mt-4 p-3 text-center bg-green-100 border border-green-200 text-green-800 rounded-lg flex items-center justify-center gap-3 text-sm">
                    <Check size={20} />
                    <span>Recording confirmed: <strong>{finalAudioFile.name}</strong></span>
                </div>
            )}
        </div>
    );
}
