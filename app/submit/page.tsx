"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mic, Upload, CheckCircle, ArrowRight, ArrowLeft, Pencil, Info, ImagePlus, X, Plus, PartyPopper, Loader2, Languages, Camera, UploadCloud, UserCircle} from 'lucide-react';
import AudioRecorder from '@/app/components/AudioRecorder';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from "firebase/firestore"; 
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from '@/app/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';
import { APIProvider } from '@vis.gl/react-google-maps';
import LocationSearch from '@/app/components/LocationSearch';
import type { Place } from '@/app/components/LocationSearch';
import toast from 'react-hot-toast';

const InstagramIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const FacebookIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="m9.5 9.5 5 5"/><path d="m14.5 9.5-5 5"/></svg>;

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/submit', label: 'Submit' },
  { href: '/explore', label: 'Explore' },
  { href: '/about#contact', label: 'Contact' },
];

const socialLinks = [
  { href: 'https://instagram.com', label: 'Instagram', icon: <InstagramIcon /> },
  { href: 'https://facebook.com', label: 'Facebook', icon: <FacebookIcon /> },
  { href: 'https://x.com', label: 'X', icon: <XIcon /> },
];

const Stepper = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => {
    return (
        <div className="w-full">
            {/* --- Mobile View: Compact bar with current step text below --- */}
            <div className="md:hidden">
                {/* The visual bar of circles and connecting lines */}
                <div className="flex items-center">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = currentStep > stepNumber;
                        const isActive = currentStep === stepNumber;
                        return (
                            <React.Fragment key={index}>
                                {/* Circle */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${(isCompleted || isActive) ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
                                    {isCompleted ? <CheckCircle size={16} /> : stepNumber}
                                </div>
                                {/* Connecting line (unless it's the last step) */}
                                {index < steps.length - 1 && (
                                    <div className={`flex-auto border-t-2 transition-colors mx-2 ${isCompleted ? 'border-stone-800' : 'border-stone-200'}`}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                {/* Text for the current step, displayed below the bar */}
                <p className="mt-4 text-center text-sm font-medium text-stone-800">
                    Step {currentStep}: {steps[currentStep - 1]}
                </p>
            </div>

            {/* --- Desktop View: Full Horizontal Stepper (Unchanged) --- */}
            <div className="hidden md:flex w-full items-start justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isActive = currentStep === stepNumber;

                    return (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center text-center w-1/5 flex-shrink min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors shrink-0 ${(isCompleted || isActive) ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
                                    {isCompleted ? <CheckCircle size={24} /> : stepNumber}
                                </div>
                                <p className={`mt-2 text-sm font-medium ${(isCompleted || isActive) ? 'text-stone-800' : 'text-stone-500'}`}>{step}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-auto border-t-2 transition-colors mt-5 ${isCompleted ? 'border-stone-800' : 'border-stone-200'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

// --- Alternating fun facts and progress messages for loading state ---
const FUN_FACTS = [
  "Did you know? The word 'echo' comes from Greek mythology, where Echo was a nymph who could only repeat the words of others.",
  "Over 40% of the world's 7,000+ languages are endangered and may disappear within the next century.",
  "Every two weeks, another language is lost somewhere in the world.",
  "Recording stories helps preserve culture and memory for future generations.",
  "Some languages have no written form and can only be preserved through audio recordings.",
  "The oldest known audio recording is from 1860, using a device called a phonautograph.",
  "Your story could help researchers and communities revive lost languages!",
  "Language is the key to understanding history, identity, and belonging.",
];

const PROGRESS_MESSAGES = [
  "Hang tight, we're transcribing your story...",
  "Just a moment more!",
  "We're working on it...",
  "Almost there!",
  "Thank you for your patience.",
  "Almost done!",
];

// Alternates between progress messages and fun facts
const ALTERNATING_ITEMS: (string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined)[] = [];
for (let i = 0; i < Math.max(FUN_FACTS.length, PROGRESS_MESSAGES.length); i++) {
  if (i < PROGRESS_MESSAGES.length) ALTERNATING_ITEMS.push(PROGRESS_MESSAGES[i]);
  if (i < FUN_FACTS.length) ALTERNATING_ITEMS.push(FUN_FACTS[i]);
}

function TranscriptionLoadingFacts() {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % ALTERNATING_ITEMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="w-full h-48 p-4 bg-stone-50 rounded-lg flex flex-col items-center justify-center gap-3 text-stone-600 animate-fade-in">
      <Loader2 size={24} className="animate-spin mb-2" />
      <p className="font-semibold text-base">Generating transcription... this may take a minute.</p>
      <div className="mt-4 text-center text-sm text-black italic max-w-xl">
        {ALTERNATING_ITEMS[index]}
      </div>
    </div>
  );
}


export default function SubmitPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [storyTitle, setStoryTitle] = useState('');
    const [speakerName, setSpeakerName] = useState('');
    const [speakerAge, setSpeakerAge] = useState('');
    const [speakerPronouns, setSpeakerPronouns] = useState('');
    const [speakerPhoto, setSpeakerPhoto] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioFirebaseUrl, setAudioFirebaseUrl] = useState<string | null>(null);
    const [audioTab, setAudioTab] = useState('record');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');
    const [location, setLocation] = useState<Place | null>(null);
    const [summary, setSummary] = useState('');

    
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { user } = useAuth();
    
    const [dateType, setDateType] = useState<'period' | 'year'>('period');
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [specificYear, setSpecificYear] = useState('');

    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [newPhoto, setNewPhoto] = useState<File | null>(null);

    const steps = ["Who's Speaking", "Record Audio", "Review Transcription", "Add Details", "Review & Submit"];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    

    const [transcription, setTranscription] = useState('');
    const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [suggestedSummary, setSuggestedSummary] = useState('');
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

    const [translatedText, setTranslatedText] = useState('');
    const [translationStatus, setTranslationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [targetLanguage, setTargetLanguage] = useState('English'); 
    const commonLanguages = [
        "English", "Spanish", "French", "German", "Mandarin Chinese", "Cantonese", "Japanese", "Korean", 
        "Italian", "Portuguese", "Russian", "Arabic", "Hindi", "Bengali", "Punjabi", "Marathi",
        "Telugu", "Tamil", "Gujarati", "Kannada", "Urdu", "Persian (Farsi)", "Turkish", "Vietnamese", 
        "Thai", "Malay", "Indonesian", "Filipino", "Dutch", "Swedish", "Norwegian", "Danish", 
        "Finnish", "Greek", "Hebrew", "Polish", "Ukrainian", "Czech", "Hungarian", "Romanian", "Swahili"
    ].sort(); // Sort them alphabetically

    const [language, setLanguage] = useState('');
    const [otherLanguage, setOtherLanguage] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        // Cleanup function to stop the camera
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    useEffect(() => {
        if (speakerPhoto) {
            const url = URL.createObjectURL(speakerPhoto);
            setPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPhotoPreviewUrl(null);
    }, [speakerPhoto]);

    useEffect(() => {
        setTranscription('');
        setTranscriptionStatus('idle');
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            setAudioPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setAudioPreviewUrl(null);
    }, [audioFile]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSpeakerPhoto(file);
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setAudioFile(file);
    };

    const handleTagClick = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };
    
    const handleAddCustomTag = () => {
        const newTag = customTag.trim();
        if (newTag && !selectedTags.includes(newTag)) {
            setSelectedTags(prev => [...prev, newTag]);
            setCustomTag('');
        }
    };
    
    const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustomTag();
        }
    };
    
    const stopCameraStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };
    
    const startCamera = async () => {
        stopCameraStream();
        setSpeakerPhoto(null);
        setPhotoPreviewUrl(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Could not access camera. Please check permissions.");
        }
    };

    const takePicture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const newFile = new File([blob], "speaker-photo.jpg", { type: "image/jpeg" });
                setSpeakerPhoto(newFile);
                setPhotoPreviewUrl(URL.createObjectURL(newFile));
            }
        }, 'image/jpeg');

        stopCameraStream();
    };

    const handleGenerateTranscription = async () => {
        if (!audioFile || transcriptionStatus === 'generating' || transcriptionStatus === 'success') {
            return;
        }
        setTranscriptionStatus('generating');
        setTranscription('');
        setAudioFirebaseUrl(null);
        try {
            await toast.promise(
                (async () => {
                    // Upload audio to Firebase Storage
                    const audioRef = ref(storage, `stories/audio/${Date.now()}-${audioFile.name}`);
                    const audioSnapshot = await uploadBytes(audioRef, audioFile);
                    const url = await getDownloadURL(audioSnapshot.ref);
                    setAudioFirebaseUrl(url);
                    // Send URL and mimeType to API
                    const response = await fetch('/api/transcribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audioUrl: url, mimeType: audioFile.type }),
                    });
                    if (!response.ok) throw new Error('Transcription API call failed');
                    const result = await response.json();
                    setTranscription(result.transcription);
                    setTranscriptionStatus('success');
                })(),
                {
                    loading: 'Uploading audio & generating transcription...',
                    success: 'Transcription complete!',
                    error: 'Failed to transcribe audio.',
                }
            );
        } catch (error) {
            console.error("Error generating transcription:", error);
            setTranscriptionStatus('error');
        }
    };

    const handleTranslate = async () => {
        if (!transcription || transcriptionStatus !== 'success') {
            alert("Please wait for the original transcription to finish first.");
            return;
        }
        setTranslationStatus('generating');
        setTranslatedText('');
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: transcription, targetLanguage }),
            });
            if (!response.ok) throw new Error('Translation API call failed');
            const result = await response.json();
            setTranslatedText(result.translatedText);
            setTranslationStatus('success');
        } catch (error) {
            console.error("Error translating text:", error);
            setTranslationStatus('error');
        }
    };

    const handleNext = () => {
        if (currentStep === 2) {
            handleGenerateTranscription();
        }
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };
    useEffect(() => {
        const generateSuggestions = async () => {
            // Only run on step 4, if we have a transcript, and if we haven't already fetched suggestions.
            if (currentStep === 4 && transcription && !isGeneratingSuggestions && suggestedTags.length === 0) {
                setIsGeneratingSuggestions(true);
                try {
                    const response = await fetch('/api/suggest-details', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transcription }),
                    });
    
                    if (!response.ok) throw new Error('API call failed');
    
                    const data = await response.json();
                    setSuggestedSummary(data.summary || '');
                    setSuggestedTags(data.tags || []);
    
                } catch (error) {
                    console.error("Error fetching AI suggestions:", error);
                    toast.error("Could not generate AI suggestions.");
                } finally {
                    setIsGeneratingSuggestions(false);
                }
            }
        };
    
        generateSuggestions();
    }, [currentStep, transcription]);

    const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const isStepValid = (() => {
        if (currentStep === 1) return speakerName.trim() !== '';
        if (currentStep === 2) return !!audioFile;
        if (currentStep === 3) return transcriptionStatus === 'success' || transcriptionStatus === 'error';
        if (currentStep === 4) {
            const isDateProvided = (dateType === 'period' && startYear.trim() !== '') || (dateType === 'year' && specificYear.trim() !== '');
            return storyTitle.trim() !== '' && !!location && selectedTags.length > 0 && !!language && isDateProvided;
        }
        return true;
    })();
    
    const isSubmittable = !!(audioFirebaseUrl && storyTitle && speakerName && !!location && selectedTags.length > 0 && !!language);

    const handleFinalSubmit = async () => {
        if (!isSubmittable || !user) {
            alert("You must be logged in to submit a story.");
            return;
        }
        setIsSubmitting(true);
        try {
            let photoUrl = "";
            if (speakerPhoto) {
                const photoRef = ref(storage, `stories/photos/${Date.now()}-${speakerPhoto.name}`);
                const photoSnapshot = await uploadBytes(photoRef, speakerPhoto);
                photoUrl = await getDownloadURL(photoSnapshot.ref);
            }
            const finalLanguage = language === 'Other' ? otherLanguage.trim() : language;
            const storyData = { 
                title: storyTitle,
                age: speakerAge,
                pronouns: speakerPronouns,
                speaker: speakerName,
                photoUrl: photoUrl, 
                audioUrl: audioFirebaseUrl,
                tags: selectedTags, 
                language: finalLanguage,
                location: location,
                summary: summary,
                transcription: transcription,
                createdAt: new Date(),
                authorId: user.uid, 
                authorName: user.displayName, 
                dateType: dateType,
                startYear: dateType === 'period' ? Number(startYear) : null,
                endYear: dateType === 'period' ? Number(endYear) : null,
                specificYear: dateType === 'year' ? Number(specificYear) : null,
            };
            await addDoc(collection(db, "stories"), storyData);
            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting story: ", error);
            alert("There was an error submitting your story. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
   const handleResetForm = () => {
      setCurrentStep(1);
      setStoryTitle('');
      setSpeakerName('');
      setSpeakerAge('');
      setSpeakerPronouns('');
      setSpeakerPhoto(null);
      setAudioFile(null);
      setAudioFirebaseUrl(null);
      setSelectedTags([]);
      setCustomTag('');
      setLocation(null);
      setSummary('');
      setTranscription('');
      setTranscriptionStatus('idle');
      setTranslatedText('');
      setTranslationStatus('idle');
      setIsSubmitted(false);
    }
    if (!isMounted) {
        return null;
    }
    return (
        <div className="bg-white min-h-screen font-sans">
            <Navbar />

            <main className="py-14 sm:py-16">
                <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-10">
                    {isSubmitted ? (
                        <div className="bg-white rounded-xl shadow-md border border-stone-200 text-center p-8 sm:p-16 animate-fade-in flex flex-col items-center">
                            <PartyPopper className="h-16 w-16 text-green-500" />
                            <h2 className="mt-6 font-serif text-3xl sm:text-4xl text-stone-900">Thank You!</h2>
                            <p className="mt-4 text-lg text-stone-600 max-w-xl">
                                Your story has been successfully submitted. We're honored to be entrusted with this piece of your history.
                            </p>
                            
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button 
                                    type="button" 
                                    onClick={handleResetForm}
                                    className="w-full sm:w-auto p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-stone-800 text-white transition-all font-semibold hover:bg-stone-900"
                                >
                                    Submit Another Story
                                </button>
                                <Link 
                                    href="/explore"
                                    className="w-full sm:w-auto p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-stone-100 text-stone-800 border border-stone-300 hover:bg-stone-100 transition-all font-semibold"
                                >
                                    Explore More Stories
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-14">
                                <h1 className="text-4xl sm:text-5xl font-serif text-stone-900">Record a Memory</h1>
                                <p className="mt-4 text-lg text-stone-600">Follow our guided process to capture and preserve an important story.</p>
                            </div>

                            <div className="mb-12">
                              <Stepper currentStep={currentStep} steps={steps} />
                            </div>

                            <div className="bg-white rounded-xl shadow-md border border-stone-200">
                              <div className="p-6 sm:p-8 border-b border-stone-200">
                                <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-3"><Pencil size={20} /> {steps[currentStep - 1]}</h3>
                              </div>

                              <div className="p-6 sm:p-8">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    {/* Step 1: Who's Speaking */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div>
                                                <label htmlFor="speakerName" className="block text-sm font-medium text-stone-900 mb-1">Speaker Name <span className="text-red-500">*</span></label>
                                                <input type="text" id="speakerName" value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" required />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div><label htmlFor="speakerAge" className="block text-sm font-medium text-stone-700 mb-1">Age <span className="text-stone-500">(Optional)</span></label><input type="text" id="speakerAge" value={speakerAge} onChange={(e) => setSpeakerAge(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" /></div>
                                                <div><label htmlFor="speakerPronouns" className="block text-sm font-medium text-stone-700 mb-1">Pronouns <span className="text-stone-500">(Optional)</span></label><input type="text" id="speakerPronouns" placeholder="e.g., she/her" value={speakerPronouns} onChange={(e) => setSpeakerPronouns(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" /></div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700">Photo of Speaker <span className="text-stone-500">(Optional)</span></label>
                                                <div className="mt-2 p-6 rounded-lg border border-stone-200 bg-stone-50 text-center">
                                                    <div className="w-65 h-65 mx-auto bg-stone-200 rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner">
                                                        {photoPreviewUrl && !stream && (
                                                            <Image src={photoPreviewUrl} alt="Speaker preview" fill className="object-cover" />
                                                        )}
                                                        {stream && (
                                                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                                        )}
                                                        {!photoPreviewUrl && !stream && (
                                                            <UserCircle className="h-16 w-16 text-stone-400" />
                                                        )}
                                                        <canvas ref={canvasRef} className="hidden" />
                                                    </div>
                                                    <div className="mt-4">
                                                        {stream ? (
                                                          <div className="flex items-center justify-center gap-2">
                                                            <button type="button" onClick={takePicture} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"><Camera size={16}/> Snap Photo</button>
                                                            <button type="button" onClick={stopCameraStream} className="p-2 text-stone-500 hover:text-stone-800"><X size={20}/></button>
                                                          </div>
                                                        ) : newPhoto ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <p className="text-sm text-stone-600">Photo selected.</p>
                                                                <button type="button" onClick={() => { setSpeakerPhoto(null); setPhotoPreviewUrl(null); }} className="font-semibold text-xs text-red-500 hover:underline">Remove</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                                <label htmlFor="photo-upload" className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 cursor-pointer">
                                                                    <UploadCloud size={14}/> Upload File
                                                                </label>
                                                                <button type="button" onClick={startCamera} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-100">
                                                                    <Camera size={14}/> Use Camera
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Other steps remain the same */}
                                    {currentStep === 2 && (
                                      <div className="animate-fade-in">
                                        {!user ? (
                                          <div className="text-center text-stone-600 p-8">
                                            <strong>Sign in to record and upload an audio memory.</strong>
                                          </div>
                                        ) : (
                                          <>
                                            <AudioRecorder onRecordingComplete={setAudioFile} />
                                            {audioFile && (
                                              <div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 text-sm">
                                                <CheckCircle size={20} />
                                                <span>File ready: <strong>{audioFile.name}</strong></span>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                    {currentStep === 3 && (
        <div className="space-y-6 text-stone-700 animate-fade-in">
            <div>
                <label htmlFor="transcription" className="block text-lg font-semibold text-stone-800 mb-2">
                    Review & Edit Transcription
                </label>
                <p className="text-sm text-stone-500 mb-4">
                    The AI-generated transcription is below. Please review and edit it for accuracy before proceeding.
                </p>
                {transcriptionStatus === 'generating' && <TranscriptionLoadingFacts />}
                {(transcriptionStatus === 'success' || transcriptionStatus === 'error') && (
                    <textarea
                        id="transcription"
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        rows={10}
                        className="w-full p-4 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 whitespace-pre-wrap"
                        placeholder={transcriptionStatus === 'error' ? 'Could not generate transcription. You can type it manually here.' : 'Edit your transcription...'}
                    />
                )}
            </div>
                                            {transcriptionStatus === 'success' && (
                                                <div className="pt-6 border-t border-stone-200 space-y-4">
                                                    <h3 className="text-xl font-serif font-semibold text-stone-800">Translate Transcription (Optional)</h3>
                                                    <div className="flex items-center gap-4">
                                                        <select 
                                                            value={targetLanguage} 
                                                            onChange={(e) => setTargetLanguage(e.target.value)} 
                                                            className="w-full p-3 border border-stone-300 rounded-lg bg-white"
                                                        >
                                                            {commonLanguages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
                                                        </select>
                                                        <button 
                                                            type="button" 
                                                            onClick={handleTranslate} 
                                                            disabled={translationStatus === 'generating'} 
                                                            className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-blue-600 text-white transition-all font-semibold disabled:bg-blue-300 hover:bg-blue-700"
                                                        >
                                                            {translationStatus === 'generating' ? <Loader2 size={20} className="animate-spin" /> : <Languages size={20} />}
                                                            Translate
                                                        </button>
                                                    </div>
                                                    {translationStatus === 'generating' && (<div className="mt-2 p-4 bg-stone-50 rounded-lg flex items-center justify-center gap-3 text-stone-600"><Loader2 size={20} className="animate-spin" /><p>Translating...</p></div>)}
                                                    {translationStatus === 'success' && (<p className="mt-1 text-stone-600 whitespace-pre-wrap p-4 bg-stone-50 rounded-lg">{translatedText}</p>)}
                                                    {translationStatus === 'error' && (<p className="mt-2 text-red-600 p-4 bg-red-50 rounded-lg">Could not translate text.</p>)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {currentStep === 4 && (
                                        <div className="space-y-6 animate-fade-in">
                                            {/* Story Title Input */}
                                            <div>
                                                <label htmlFor="storyTitle" className="block text-sm font-medium text-stone-700 mb-1">Story Title <span className="text-red-500">*</span></label>
                                                <input type="text" id="storyTitle" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" required />
                                            </div>

                                            {/* Loading indicator */}
                                            {isGeneratingSuggestions && (
                                                <div className="flex items-center gap-3 text-sm text-stone-600 p-3 bg-stone-50 rounded-lg border border-stone-200">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Generating AI suggestions from your transcript...
                                                </div>
                                            )}

                                            {/* --- REDESIGNED Tags Section --- */}
                                            <div className="space-y-4">
                                                <label className="block text-sm font-medium text-stone-700">Tags <span className="text-red-500">*</span></label>

                                                {/* Area to display currently selected tags */}
                                                <div className="flex flex-wrap gap-2 p-3 min-h-[50px] bg-stone-50 border border-stone-200 rounded-lg">
                                                    {selectedTags.length > 0 ? (
                                                        selectedTags.map(tag => (
                                                            <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-stone-800 text-white rounded-full text-sm font-medium animate-fade-in">
                                                                {tag}
                                                                <button type="button" onClick={() => handleTagClick(tag)} className="bg-stone-600 rounded-full p-0.5 hover:bg-stone-500 transition-colors">
                                                                    <X size={12} />
                                                                </button>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-stone-500 self-center">Click suggestions or add your own tags below.</p>
                                                    )}
                                                </div>
                                                
                                                {/* AI Suggested Tags */}
                                                {suggestedTags.length > 0 && !isGeneratingSuggestions && (
                                                    <div>
                                                        <p className="text-sm font-medium text-stone-600 mb-2 flex items-center gap-2"><PartyPopper size={16}/> AI Suggestions</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {suggestedTags.map(tag => {
                                                                const isSelected = selectedTags.includes(tag);
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={`suggestion-${tag}`}
                                                                        onClick={() => handleTagClick(tag)}
                                                                        disabled={isSelected}
                                                                        className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium transition-colors border ${
                                                                            isSelected
                                                                                ? 'bg-green-100 text-green-700 border-green-200 cursor-not-allowed'
                                                                                : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                                                                        }`}
                                                                    >
                                                                        {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />}
                                                                        {tag}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Custom Tag Input */}
                                                <div>
                                                    <p className="text-sm font-medium text-stone-600 mb-2">Add your own tag:</p>
                                                    <div className="flex items-center gap-2">
                                                        <input type="text" value={customTag} onChange={(e) => setCustomTag(e.target.value)} onKeyDown={handleCustomTagKeyDown} placeholder="Type here and press Enter" className="flex-grow p-3 border border-stone-300 rounded-lg" />
                                                        <button type="button" onClick={handleAddCustomTag} className="p-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors">
                                                            <Plus size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div>
                                                <label htmlFor="location" className="block text-sm font-medium text-stone-700 mb-1">Location <span className="text-red-500">*</span></label>
                                                <APIProvider apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY!}>
                                                    <LocationSearch onPlaceSelect={(place) => setLocation(place)} />
                                                </APIProvider>
                                            </div>

                                            {/* Language of Story */}
                                            <div>
                                                <label htmlFor="language" className="block text-sm font-medium text-stone-700 mb-1">Language of Story <span className="text-red-500">*</span></label>
                                                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={`w-full p-3 border border-stone-300 rounded-lg bg-white ${!language ? 'text-stone-500' : 'text-stone-900'}`} required>
                                                    <option value="" disabled>-- Select a language --</option>
                                                    {commonLanguages.map(lang => (<option key={lang} value={lang}>{lang}</option>))}
                                                    <option value="Other">Other...</option>
                                                </select>
                                                {language === 'Other' && (<input type="text" placeholder="Please specify the language" value={otherLanguage} onChange={(e) => setOtherLanguage(e.target.value)} className="w-full p-3 mt-2 border border-stone-300 rounded-lg animate-fade-in text-stone-900" required />)}
                                            </div>

                                            {/* Date of Story */}
                                            <div className="space-y-4 rounded-lg border border-stone-200 p-4">
                                                <h4 className="font-medium text-stone-700">When did this story take place? <span className="text-red-500">*</span></h4>
                                                <div className="flex items-center gap-2 rounded-lg bg-stone-100 p-1">
                                                    <button type="button" onClick={() => setDateType('period')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${dateType === 'period' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}>A Time Period</button>
                                                    <button type="button" onClick={() => setDateType('year')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${dateType === 'year' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}>A Specific Year</button>
                                                </div>
                                                {dateType === 'period' && (<div className="grid grid-cols-2 gap-4 animate-fade-in"><div><label htmlFor="startYear" className="text-sm text-stone-600">Start Year</label><input id="startYear" type="number" placeholder="e.g., 1960" value={startYear} onChange={e => setStartYear(e.target.value)} className="w-full mt-1 p-3 border border-stone-300 rounded-lg" /></div><div><label htmlFor="endYear" className="text-sm text-stone-600">End Year</label><input id="endYear" type="number" placeholder="e.g., 1969" value={endYear} onChange={e => setEndYear(e.target.value)} className="w-full mt-1 p-3 border border-stone-300 rounded-lg" /></div></div>)}
                                                {dateType === 'year' && (<div className="animate-fade-in"><label htmlFor="specificYear" className="text-sm text-stone-600">Year</label><input id="specificYear" type="number" placeholder="e.g., 1995" value={specificYear} onChange={e => setSpecificYear(e.target.value)} className="w-full mt-1 p-3 border border-stone-300 rounded-lg" /></div>)}
                                            </div>

                                            {/* Summary Section */}
                                            <div>
                                                <label htmlFor="summary" className="block text-sm font-medium text-stone-700 mb-1">Describe the story <span className="text-stone-500">(Optional)</span></label>
                                                {suggestedSummary && !isGeneratingSuggestions && (
                                                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2"><PartyPopper size={16}/> AI Suggestion</p>
                                                        <p className="text-stone-700 text-sm">{suggestedSummary}</p>
                                                        <button type="button" onClick={() => setSummary(suggestedSummary)} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                                                            Use this summary
                                                        </button>
                                                    </div>
                                                )}
                                                <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full p-3 border border-stone-300 rounded-lg"></textarea>
                                            </div>
                                        </div>
                                    )}
                                    {currentStep === 5 && (
                                        <div className="space-y-4 text-stone-700 animate-fade-in">
                                            {audioPreviewUrl && (<div className="bg-stone-50 rounded-lg p-4"><p className="text-sm font-medium text-stone-600 mb-2">Listen to your recording:</p><audio src={audioPreviewUrl} controls className="w-full" /></div>)}
                                            <h4 className="text-lg font-semibold text-stone-800 border-b border-stone-200 pb-2 pt-4">Review your story details:</h4>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Title:</strong> <span className="text-right">{storyTitle || 'Not provided'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Speaker:</strong> <span className="text-right">{speakerName || 'Not provided'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Tags:</strong> <span className="text-right">{selectedTags.join(', ') || 'None'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Location:</strong> <span className="text-right">{location?.name || 'None'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100 items-start"><strong className="font-medium text-stone-500">Photo:</strong> {photoPreviewUrl ? <img src={photoPreviewUrl} alt="Speaker preview" className="w-16 h-16 rounded-lg object-cover" /> : 'None'}</div>
                                            <div className="py-3"><strong className="font-medium text-stone-500">Summary:</strong> <p className="mt-1 text-stone-600 whitespace-pre-wrap">{summary || 'None'}</p></div>
                                            <div className="py-3"><strong className="font-medium text-stone-500">Final Transcription:</strong><p className="mt-1 text-stone-600 whitespace-pre-wrap p-4 bg-stone-50 rounded-lg">{transcription || 'No transcription was provided.'}</p></div>
                                        </div>
                                    )}
                                </form>
                                <div className="pt-8 border-t border-stone-200 mt-8 flex justify-between items-center">
                                    <button type="button" onClick={handleBack} className={`p-3 rounded-lg flex items-center justify-center gap-2 bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-all font-semibold ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ArrowLeft size={20}/> Back</button>
                                   {currentStep < steps.length ? (
                                        <button type="button" onClick={handleNext} disabled={!isStepValid} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-stone-800 text-white transition-all font-semibold disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-stone-900">Next <ArrowRight size={20}/></button>
                                   ) : (
                                        <button type="button" onClick={handleFinalSubmit} disabled={!isSubmittable || isSubmitting} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white transition-all font-semibold disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-green-700">{isSubmitting ? 'Submitting...' : 'Submit Story'} <CheckCircle size={20}/></button>
                                   )}
                                </div>
                              </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="bg-stone-900 text-stone-300">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                    <Link href="/" className="text-2xl font-bold text-white">Echo</Link>
                    <p className="mt-4 text-stone-400 max-w-md mx-auto">Hold onto the stories that hold us together.</p>
                    <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 text-sm font-medium">
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-stone-300">
                            {footerLinks.map((link) => (<Link key={link.href} href={link.href} className="hover:text-white transition-colors">{link.label}</Link>))}
                        </div>
                        <div className="h-4 w-px bg-stone-700 hidden md:block"></div>
                        <div className="flex items-center gap-5">
                            {socialLinks.map((social) => (<a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="text-stone-400 hover:text-white transition-colors">{social.icon}</a>))}
                        </div>
                    </div>
                    <p className="mt-10 text-xs text-stone-500">&copy; {new Date().getFullYear()} Echo. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}