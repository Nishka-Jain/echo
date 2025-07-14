"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mic, Upload, CheckCircle, ArrowRight, ArrowLeft, Pencil, Info, ImagePlus, X, Plus, PartyPopper, Loader2, Languages } from 'lucide-react';
import AudioRecorder from '@/app/components/AudioRecorder';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from '@/app/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';
import { APIProvider } from '@vis.gl/react-google-maps';
import LocationSearch from '@/app/components/LocationSearch';
import type { Place } from '@/app/components/LocationSearch';

const Stepper = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => (
    <div className="flex w-full items-center justify-center">
        {steps.map((step, index) => (
            <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= index + 1 ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
                        {currentStep > index + 1 ? <CheckCircle size={24} /> : index + 1}
                    </div>
                    <p className={`mt-2 text-sm font-medium w-24 ${currentStep >= index + 1 ? 'text-stone-800' : 'text-stone-500'}`}>{step}</p>
                </div>
                {index < steps.length - 1 && (
                    <div className={`flex-auto border-t-2 transition-colors mx-4 ${currentStep > index + 1 ? 'border-stone-800' : 'border-stone-200'}`}></div>
                )}
            </React.Fragment>
        ))}
    </div>
);

// --- Main Page Component ---
export default function SubmitPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [storyTitle, setStoryTitle] = useState('');
    const [speakerName, setSpeakerName] = useState('');
    const [speakerAge, setSpeakerAge] = useState('');
    const [speakerPronouns, setSpeakerPronouns] = useState('');
    const [speakerPhoto, setSpeakerPhoto] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
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


    const steps = ["Who's Speaking", "Record Audio", "Add Details", "Review & Submit"];
    const [availableTags, setAvailableTags] = useState(["Family", "Migration", "Food", "Tradition", "Love", "Loss", "Childhood", "Work"]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // --- New State for Transcription ---
    const [transcription, setTranscription] = useState('');
    const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

    // --- NEW Translation State ---
    const [translatedText, setTranslatedText] = useState('');
    const [translationStatus, setTranslationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [targetLanguage, setTargetLanguage] = useState('English'); 

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    
    const handleAddCustomTag = () => {
        const newTag = customTag.trim();
        if (newTag && !selectedTags.includes(newTag)) {
            if (!availableTags.includes(newTag)) {
                setAvailableTags(prev => [...prev, newTag]);
            }
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

    // --- NEW Transcription Handler ---
    const handleGenerateTranscription = async () => {
        if (!audioFile || transcriptionStatus === 'generating' || transcriptionStatus === 'success') {
            return; // Don't re-transcribe if already done or in progress
        }
        setTranscriptionStatus('generating');
        setTranscription('');
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Transcription API call failed');
            const result = await response.json();
            setTranscription(result.transcription);
            setTranscriptionStatus('success');
        } catch (error) {
            console.error("Error generating transcription:", error);
            setTranscriptionStatus('error');
        }
    };

    // --- NEW Translation Handler ---
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

    //const handleNext = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
    const handleNext = () => {
        // When moving to the final step, trigger transcription
        if (currentStep === 3) {
            handleGenerateTranscription();
        }
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    const isStepValid = (() => {
        if (currentStep === 1) return speakerName.trim() !== '';
        if (currentStep === 2) return !!audioFile;
        if (currentStep === 3) return storyTitle.trim() !== '' && !!location && selectedTags.length > 0;
        return true;
    })();
    
    const isSubmittable = !!(audioFile && storyTitle && speakerName && !!location && selectedTags.length > 0);

    const handleFinalSubmit = async () => {
        
        if (!isSubmittable || !user) { // Also check if the user exists
            alert("You must be logged in to submit a story.");
            return;
        }

        if (!isSubmittable) return;
        setIsSubmitting(true); // Start loading state
    
        try {
            let audioUrl = "";
            let photoUrl = "";
    
            // 1. Upload Audio File to Firebase Storage
            if (audioFile) {
                const audioRef = ref(storage, `stories/audio/${Date.now()}-${audioFile.name}`);
                const audioSnapshot = await uploadBytes(audioRef, audioFile);
                audioUrl = await getDownloadURL(audioSnapshot.ref);
            }
    
            // 2. Upload Photo File (if it exists)
            if (speakerPhoto) {
                const photoRef = ref(storage, `stories/photos/${Date.now()}-${speakerPhoto.name}`);
                const photoSnapshot = await uploadBytes(photoRef, speakerPhoto);
                photoUrl = await getDownloadURL(photoSnapshot.ref);
            }
    
            // 3. Create the story object with the new URLs
            const storyData = { 
                title: storyTitle,
                speaker: speakerName,
                age: speakerAge,
                pronouns: speakerPronouns,
                photoUrl: photoUrl, // URL from Firebase Storage
                audioUrl: audioUrl, // URL from Firebase Storage
                tags: selectedTags, 
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
    
            // 4. Save the story metadata to Firestore
            const docRef = await addDoc(collection(db, "stories"), storyData);
            console.log("Document written with ID: ", docRef.id);
    
            setIsSubmitted(true); // Show success message
    
        } catch (error) {
            console.error("Error submitting story: ", error);
            alert("There was an error submitting your story. Please try again.");
        } finally {
            setIsSubmitting(false); // Stop loading state
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
      setSelectedTags([]);
      setCustomTag('');
      setLocation(null);
      setSummary('');
      // The useEffect handles resetting these when audioFile changes, but it's here bc it's good practice
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
                        <div className="bg-white rounded-xl shadow-md border border-stone-200 text-center p-8 sm:p-16 animate-fade-in">
                            <PartyPopper className="h-16 w-16 mx-auto text-green-500" />
                            <h2 className="mt-6 font-serif text-3xl sm:text-4xl text-stone-900">Thank You!</h2>
                            <p className="mt-4 text-lg text-stone-600">Your story has been successfully submitted. We're honored to be entrusted with this piece of your history.</p>
                            <button 
                                type="button" 
                                onClick={handleResetForm}
                                className="mt-8 p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-stone-800 text-white transition-all font-semibold hover:bg-stone-900 mx-auto"
                            >
                                Submit Another Story
                            </button>
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
                                <form>
                                    {/* Step 1: Who's Speaking */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div>
                                                <label htmlFor="speakerName" className="block text-sm font-medium text-stone-700 mb-1">Speaker Name <span className="text-red-500">*</span></label>
                                                <input type="text" id="speakerName" value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" required />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div><label htmlFor="speakerAge" className="block text-sm font-medium text-stone-700 mb-1">Age <span className="text-stone-500">(Optional)</span></label><input type="text" id="speakerAge" value={speakerAge} onChange={(e) => setSpeakerAge(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" /></div>
                                                <div><label htmlFor="speakerPronouns" className="block text-sm font-medium text-stone-700 mb-1">Pronouns <span className="text-stone-500">(Optional)</span></label><input type="text" id="speakerPronouns" placeholder="e.g., she/her" value={speakerPronouns} onChange={(e) => setSpeakerPronouns(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" /></div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Photo of Speaker <span className="text-stone-500">(Optional)</span></label>
                                                {!photoPreviewUrl ? (
                                                    <label htmlFor="photo-upload" className="relative block w-full border-2 border-stone-300 border-dashed rounded-lg p-12 text-center hover:border-stone-400 cursor-pointer">
                                                        <ImagePlus className="mx-auto h-12 w-12 text-stone-400" /><span className="mt-2 block text-sm font-medium text-stone-600">Upload a photo</span>
                                                        <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-32 h-32">
                                                        <img src={photoPreviewUrl} alt="Speaker preview" className="w-32 h-32 rounded-lg object-cover" />
                                                        <button type="button" onClick={() => setSpeakerPhoto(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><X size={16} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {/* Step 2: Record */}
                                    {currentStep === 2 && (
                                      <div className="animate-fade-in">
                                        <div className="flex border-b border-stone-200 mb-6">
                                            <button type="button" onClick={() => setAudioTab('record')} className={`px-4 py-3 text-sm font-medium transition-colors ${audioTab === 'record' ? 'border-b-2 border-stone-800 text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>Record Audio</button>
                                            <button type="button" onClick={() => setAudioTab('upload')} className={`px-4 py-3 text-sm font-medium transition-colors ${audioTab === 'upload' ? 'border-b-2 border-stone-800 text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>Upload Audio</button>
                                        </div>
                                        {audioTab === 'record' && (<AudioRecorder onRecordingComplete={setAudioFile} />)}
                                        {audioTab === 'upload' && (<div className="text-center py-12 border border-dashed border-stone-300 rounded-lg"><Upload size={40} className="mx-auto text-stone-400 mb-4"/><p className="text-stone-500 mb-4">Upload an audio file (MP3, WAV, etc.)</p><label htmlFor="audio-upload-main" className="p-3 px-6 rounded-lg bg-stone-800 text-white hover:bg-stone-900 cursor-pointer transition-colors font-semibold">Choose File<input id="audio-upload-main" type="file" accept="audio/*" className="hidden" onChange={handleAudioChange}/></label></div>)}
                                         {audioFile && (<div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 text-sm"><CheckCircle size={20} /><span>File ready: <strong>{audioFile.name}</strong></span></div>)}
                                      </div>
                                    )}
                                    {/* Step 3: Add Details */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div><label htmlFor="storyTitle" className="block text-sm font-medium text-stone-700 mb-1">Story Title <span className="text-red-500">*</span></label><input type="text" id="storyTitle" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" required /></div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Tags <span className="text-red-500">*</span> <span className="text-stone-500">(What is this story about?)</span></label>
                                                <div className="flex flex-wrap gap-2">{availableTags.map(tag => (<button type="button" key={tag} onClick={() => handleTagClick(tag)} className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${selectedTags.includes(tag) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'}`}>{tag}</button>))}</div>
                                                <div className="flex items-center gap-2 mt-4"><input type="text" value={customTag} onChange={(e) => setCustomTag(e.target.value)} onKeyDown={handleCustomTagKeyDown} placeholder="Add your own tag and press Enter" className="flex-grow p-3 border border-stone-300 rounded-lg" /><button type="button" onClick={handleAddCustomTag} className="p-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors"><Plus size={20} /></button></div>
                                            </div>
                                            <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-stone-700 mb-1">Location <span className="text-red-500">*</span></label>
                                                <APIProvider apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY!}>
                                                    <LocationSearch onPlaceSelect={(place) => setLocation(place)} />
                                                </APIProvider>
                                            </div>
                                            <div className="space-y-4 rounded-lg border border-stone-200 p-4">
                                                <h4 className="font-medium text-stone-700">When did this story take place? <span className="text-red-500">*</span></h4>
                                                
                                                {/* The toggle buttons */}
                                                <div className="flex items-center gap-2 rounded-lg bg-stone-100 p-1">
                                                    <button type="button" onClick={() => setDateType('period')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${dateType === 'period' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}>
                                                        A Time Period
                                                    </button>
                                                    <button type="button" onClick={() => setDateType('year')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${dateType === 'year' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:bg-stone-200'}`}>
                                                        A Specific Year
                                                    </button>
                                                </div>

                                                {/* Conditional Inputs */}
                                                {dateType === 'period' && (
                                                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                                        <div>
                                                            <label htmlFor="startYear" className="text-sm text-stone-600">Start Year</label>
                                                            <input id="startYear" type="number" placeholder="e.g., 1960" value={startYear} onChange={e => setStartYear(e.target.value)} className="w-full mt-1 p-3 border border-stone-300 rounded-lg" />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="endYear" className="text-sm text-stone-600">End Year</label>
                                                            <input id="endYear" type="number" placeholder="e.g., 1969" value={endYear} onChange={e => setEndYear(e.target.value)} className="w-full mt-1 p-3 border border-stone-300 rounded-lg" />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {dateType === 'year' && (
                                                    <div className="animate-fade-in">
                                                        <label htmlFor="specificYear" className="text-sm text-stone-600">Year</label>
                                                        <input id="specificYear" type="number" placeholder="e.g., 1995" value={specificYear} onChange={e => setSpecificYear(e.target.value)} className="w-full mt-1 p-3 border border-stone-300 rounded-lg" />
                                                    </div>
                                                )}
                                            </div>
                                            <div><label htmlFor="summary" className="block text-sm font-medium text-stone-700 mb-1">Describe the story <span className="text-stone-500">(Optional)</span></label><textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full p-3 border border-stone-300 rounded-lg"></textarea></div>
                                        </div>
                                    )}
                                    {/* Step 4: Review */}
                                    {currentStep === 4 && (
                                        <div className="space-y-4 text-stone-700 animate-fade-in">
                                            {audioPreviewUrl && (
                                                <div className="bg-stone-50 rounded-lg p-4">
                                                    <p className="text-sm font-medium text-stone-600 mb-2">Listen to your recording:</p>
                                                    <audio src={audioPreviewUrl} controls className="w-full" />
                                                </div>
                                            )}
                                            <h4 className="text-lg font-semibold text-stone-800 border-b border-stone-200 pb-2 pt-4">Review your story details:</h4>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Title:</strong> <span className="text-right">{storyTitle || 'Not provided'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Speaker:</strong> <span className="text-right">{speakerName || 'Not provided'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Tags:</strong> <span className="text-right">{selectedTags.join(', ') || 'None'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100"><strong className="font-medium text-stone-500">Location:</strong> <span className="text-right">{location?.name || 'None'}</span></div>
                                            <div className="flex justify-between py-3 border-b border-stone-100 items-start"><strong className="font-medium text-stone-500">Photo:</strong> {photoPreviewUrl ? <img src={photoPreviewUrl} alt="Speaker preview" className="w-16 h-16 rounded-lg object-cover" /> : 'None'}</div>
                                            <div className="py-3"><strong className="font-medium text-stone-500">Summary:</strong> <p className="mt-1 text-stone-600 whitespace-pre-wrap">{summary || 'None'}</p></div>
                                            
                                            {/* --- Transcription & Translation Section --- */}
                                            <div className="py-3 space-y-4">
                                                <div>
                                                    <strong className="font-medium text-stone-500">Transcription</strong>
                                                    {transcriptionStatus === 'generating' && (<div className="mt-2 p-4 bg-stone-50 rounded-lg flex items-center gap-3 text-stone-600"><Loader2 size={20} className="animate-spin" /><p>Generating transcription...</p></div>)}
                                                    {transcriptionStatus === 'success' && (<p className="mt-1 text-stone-600 whitespace-pre-wrap p-4 bg-stone-50 rounded-lg">{transcription}</p>)}
                                                    {transcriptionStatus === 'error' && (<p className="mt-1 text-red-600 p-4 bg-red-50 rounded-lg">Could not generate transcription.</p>)}
                                                </div>

                                                {transcriptionStatus === 'success' && (
                                                    <div className="pt-4 border-t border-stone-200 space-y-3">
                                                        <strong className="font-medium text-stone-500">Translate Transcription</strong>
                                                        <div className="flex items-center gap-4">
                                                            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="p-3 border border-stone-300 rounded-lg bg-white">
                                                                <option>Spanish</option>
                                                                <option>French</option>
                                                                <option>German</option>
                                                                <option>Mandarin Chinese</option>
                                                                <option>Japanese</option>
                                                                <option>Korean</option>
                                                                <option>Russian</option>
                                                                <option>Arabic</option>
                                                            </select>
                                                            <button type="button" onClick={handleTranslate} disabled={translationStatus === 'generating'} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-blue-600 text-white transition-all font-semibold disabled:bg-blue-300 hover:bg-blue-700">
                                                                {translationStatus === 'generating' ? <Loader2 size={20} className="animate-spin" /> : <Languages size={20} />}
                                                                Translate
                                                            </button>
                                                        </div>
                                                        {translationStatus === 'generating' && (<div className="mt-2 p-4 bg-stone-50 rounded-lg flex items-center gap-3 text-stone-600"><Loader2 size={20} className="animate-spin" /><p>Translating...</p></div>)}
                                                        {translationStatus === 'success' && (<p className="mt-1 text-stone-600 whitespace-pre-wrap p-4 bg-stone-50 rounded-lg">{translatedText}</p>)}
                                                        {translationStatus === 'error' && (<p className="mt-1 text-red-600 p-4 bg-red-50 rounded-lg">Could not translate text.</p>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </form>
                                {/* --- Navigation Buttons --- */}
                                <div className="pt-8 border-t border-stone-200 mt-8 flex justify-between items-center">
                                    <button type="button" onClick={handleBack} className={`p-3 rounded-lg flex items-center justify-center gap-2 bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-all font-semibold ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                        <ArrowLeft size={20}/> Back
                                    </button>
                                   {currentStep < steps.length ? (
                                        <button type="button" onClick={handleNext} disabled={!isStepValid} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-stone-800 text-white transition-all font-semibold disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-stone-900">
                                            Next <ArrowRight size={20}/>
                                        </button>
                                   ) : (
                                        <button type="button" onClick={handleFinalSubmit} disabled={!isSubmittable || isSubmitting} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white transition-all font-semibold disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-green-700">
                                              {isSubmitting ? 'Submitting...' : 'Submit Story'} <CheckCircle size={20}/>
                                        </button>
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

                    {/* Brand Name */}
                    <Link href="/" className="text-2xl font-bold text-white">
                    Echo
                    </Link>
                    
                    {/* Tagline */}
                    <p className="mt-4 text-stone-400 max-w-md mx-auto">
                    Hold onto the stories that hold us together.
                    </p>

                    {/* All Links & Socials in a single row */}
                    <div className="mt-8 flex justify-center items-center gap-6 text-sm font-medium text-stone-300">
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <Link href="/submit" className="hover:text-white transition-colors">Submit</Link>
                    <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                    <Link href="/about#contact" className="hover:text-white transition-colors">Contact</Link>
                    
                    {/* A small visual separator */}
                    <div className="h-4 w-px bg-stone-700"></div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-5">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="m9.5 9.5 5 5"/><path d="m14.5 9.5-5 5"/></svg>
                        </a>
                    </div>
                    </div>
                    
                    {/* Copyright */}
                    <p className="mt-10 text-xs text-stone-500">&copy; {new Date().getFullYear()} Echo. All rights reserved.</p>

                </div>
            </footer>
        </div>
    );
}
