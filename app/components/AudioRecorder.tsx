"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mp3Encoder } from '@breezystack/lamejs';
import { Mic, Square, Pause, Play, Check, RotateCcw, Scissors, X } from 'lucide-react';

type WaveSurferInstance = any;
type RecordPluginInstance = any;
type RegionsPluginInstance = any;
type Region = any;
// This function converts an AudioBuffer to a WAV Blob
// Converts an AudioBuffer to an MP3 Blob using lamejs
const audioBufferToMp3 = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const mp3Encoder = new Mp3Encoder(numChannels, sampleRate, 128); // 128 kbps
    let mp3Data: Uint8Array[] = [];
    const samples = buffer.getChannelData(0);
    const samplesInt16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
        samplesInt16[i] = Math.max(-32768, Math.min(32767, samples[i] * 32767));
    }
    let remaining = samplesInt16.length;
    let maxSamples = 1152;
    for (let i = 0; remaining >= maxSamples; i += maxSamples) {
        const mono = samplesInt16.subarray(i, i + maxSamples);
        const mp3buf = mp3Encoder.encodeBuffer(mono);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
        remaining -= maxSamples;
    }
    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
    return new Blob(mp3Data, { type: 'audio/mp3' });
};

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

    const [status, setStatus] = useState('loading'); 
    const [isPlaybackPlaying, setIsPlaybackPlaying] = useState<boolean>(false);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [finalAudioFile, setFinalAudioFile] = useState<File | null>(null);
    const [isWaveSurferReady, setIsWaveSurferReady] = useState<boolean>(false);
    // Stopwatch state
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    // Format seconds as mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    // Handle stopwatch timer
    useEffect(() => {
        if (status === 'recording') {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            }
        } else if (status === 'paused') {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        } else {
            // Reset timer on stop/idle/other
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [status]);

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
            setRecordingTime(0); // Reset stopwatch
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
    const handleConfirm = async () => {
        if (!recordedBlob || !wavesurferRef.current) return;
        // Decode the WAV blob to AudioBuffer
        const arrayBuffer = await recordedBlob.arrayBuffer();
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const mp3Blob = audioBufferToMp3(audioBuffer);
        const file = new File([mp3Blob], `echo-recording-${Date.now()}.mp3`, { type: 'audio/mp3' });
        setFinalAudioFile(file);
        onRecordingComplete(file);
    };
    const handleRestart = () => {
        handleCancelTrimming();
        wavesurferRef.current?.empty();
        setStatus('idle');
        setFinalAudioFile(null);
        setRecordedBlob(null);
        setRecordingTime(0);
        onRecordingComplete(null);
    };

    return (
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm w-full mx-auto space-y-4">
            <div ref={waveformRef} id="waveform" className="w-full h-32 border-2 border-dashed border-stone-300 rounded-lg bg-stone-50 transition-all"></div>

            {status === 'loading' && <p className="text-center text-stone-500 py-12">Loading Audio Editor...</p>}
            {status === 'error' && <p className="text-center text-red-500 py-12">Error loading editor. Please refresh.</p>}

            {/* Stopwatch display */}
            {(status === 'recording' || status === 'paused') && (
                <div className="flex items-center justify-center mb-2">
                    <span className="text-base font-mono text-stone-500">
                        {formatTime(recordingTime)}
                    </span>
                </div>
            )}

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
                            <Square size={20} /> End
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
