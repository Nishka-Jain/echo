"use client";

import React, { useState, useEffect } from 'react';
import { Mic, Upload, CheckCircle, ArrowRight, ArrowLeft, Pencil, Info, Play, ImagePlus, X, Plus } from 'lucide-react';
import AudioRecorder from '@/app/components/AudioRecorder';

// New Stepper Component
const Stepper = ({ currentStep, steps }) => (
    <div className="flex items-center justify-center">
        {steps.map((step, index) => (
            <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= index + 1 ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
                        {index + 1}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${currentStep >= index + 1 ? 'text-stone-800' : 'text-stone-500'}`}>{step}</p>
                </div>
                {index < steps.length - 1 && (
                    <div className={`flex-auto border-t-2 transition-colors mx-4 ${currentStep > index + 1 ? 'border-stone-800' : 'border-stone-200'}`}></div>
                )}
            </React.Fragment>
        ))}
    </div>
);


// Main Page Component
export default function SubmitPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [storyTitle, setStoryTitle] = useState('');
    const [speakerName, setSpeakerName] = useState('');
    const [speakerAge, setSpeakerAge] = useState('');
    const [speakerPronouns, setSpeakerPronouns] = useState('');
    const [speakerPhoto, setSpeakerPhoto] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [audioTab, setAudioTab] = useState('record');
    const [selectedTags, setSelectedTags] = useState([]);
    const [customTag, setCustomTag] = useState('');
    const [location, setLocation] = useState('');
    const [summary, setSummary] = useState('');
    
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);

    const steps = ["Who's Speaking", "Record", "Add Details", "Review"];
    const [availableTags, setAvailableTags] = useState(["Family", "Migration", "Food", "Tradition", "Love", "Loss", "Childhood", "Work"]);

    // Effect to create and clean up object URLs for previews
    useEffect(() => {
        if (speakerPhoto) {
            const url = URL.createObjectURL(speakerPhoto);
            setPhotoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPhotoPreviewUrl(null);
        }
    }, [speakerPhoto]);

    useEffect(() => {
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            setAudioPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setAudioPreviewUrl(null);
        }
    }, [audioFile]);


    const handleTagClick = (tag) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    
    const handleAddCustomTag = () => {
        if (customTag.trim() !== '' && !selectedTags.includes(customTag.trim())) {
            const newTag = customTag.trim();
            if (!availableTags.includes(newTag)) {
                setAvailableTags(prev => [...prev, newTag]);
            }
            setSelectedTags(prev => [...prev, newTag]);
            setCustomTag('');
        }
    };

    const handleNext = () => {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    };
    
    const handleBack = () => {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
      }
    };

    let isStepValid = false;
    if (currentStep === 1) isStepValid = speakerName.trim() !== '';
    else if (currentStep === 2) isStepValid = !!audioFile;
    else if (currentStep === 3) isStepValid = storyTitle.trim() !== '' && location.trim() !== '' && selectedTags.length > 0;
    else isStepValid = true;
    
    const isSubmittable = audioFile && storyTitle && speakerName && location.trim() !== '' && selectedTags.length > 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isSubmittable) {
            alert("Please ensure all required fields are filled.");
            return;
        }
        const storyData = { 
            title: storyTitle, 
            speaker_name: speakerName, 
            speaker_age: speakerAge,
            speaker_pronouns: speakerPronouns,
            speaker_photo_url: speakerPhoto ? `uploads/photos/${speakerPhoto.name}` : null,
            audio_url: `uploads/audio/${audioFile.name}`, 
            tags: selectedTags, 
            location, 
            summary, 
            created_at: new Date().toISOString() 
        };
        console.log("Submitting Story Data:", storyData);
        alert("Story submitted successfully! (Check the console for data)");
    };

    return (
        <div className="bg-stone-100 min-h-screen font-sans">
             <nav className="bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <a href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-stone-900 tracking-tighter">🎤 Echo</span>
                        </a>
                        <div className="hidden md:flex items-center space-x-10">
                            <a href="/about" className="text-stone-600 hover:text-stone-900 transition-colors text-base">About</a>
                            <a href="/submit" className="text-stone-800 font-bold transition-colors text-base">Record a Memory</a>
                            <a href="/explore" className="text-stone-600 hover:text-stone-900 transition-colors text-base">Explore</a>
                        </div>
                         <div className="flex items-center">
                           <a href="#login" className="text-stone-600 hover:text-stone-900 border border-stone-300 hover:border-stone-500 px-4 py-2 rounded-lg transition-colors shadow-sm">Login</a>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-serif text-stone-900">Record a Memory</h1>
                        <p className="mt-4 text-lg text-stone-600">Capture important stories in a guided, step-by-step process.</p>
                    </div>

                    <div className="mb-12">
                      <Stepper currentStep={currentStep} steps={steps} />
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-stone-200">
                      <div className="p-6 sm:p-8 border-b border-stone-200">
                        <h3 className="text-xl font-semibold text-stone-800 flex items-center gap-3"><Pencil size={20} /> {steps[currentStep - 1]}</h3>
                      </div>

                      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                        {/* Step 1: Who's Speaking */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="speakerName" className="block text-sm font-medium text-stone-700 mb-1">Speaker Name <span className="text-red-500">*</span></label>
                                    <input type="text" id="speakerName" value={speakerName} onChange={(e) => setSpeakerName(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="speakerAge" className="block text-sm font-medium text-stone-700 mb-1">Age of Speaker <span className="text-stone-500">(Optional)</span></label>
                                        <input type="text" id="speakerAge" value={speakerAge} onChange={(e) => setSpeakerAge(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="speakerPronouns" className="block text-sm font-medium text-stone-700 mb-1">Pronouns of Speaker <span className="text-stone-500">(Optional)</span></label>
                                        <input type="text" id="speakerPronouns" placeholder="e.g., she/her, they/them" value={speakerPronouns} onChange={(e) => setSpeakerPronouns(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Photo of Speaker <span className="text-stone-500">(Optional)</span></label>
                                    {!speakerPhoto ? (
                                        <label htmlFor="photo-upload" className="relative block w-full border-2 border-stone-300 border-dashed rounded-lg p-12 text-center hover:border-stone-400 cursor-pointer">
                                            <ImagePlus className="mx-auto h-12 w-12 text-stone-400" />
                                            <span className="mt-2 block text-sm font-medium text-stone-600">Upload a photo</span>
                                            <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setSpeakerPhoto(e.target.files[0])} />
                                        </label>
                                    ) : (
                                        <div className="relative w-32 h-32">
                                            <img src={photoPreviewUrl} alt="Speaker preview" className="w-32 h-32 rounded-lg object-cover" />
                                            <button type="button" onClick={() => setSpeakerPhoto(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Record */}
                        {currentStep === 2 && (
                          <div>
                            <div className="flex border-b border-stone-200 mb-6">
                                <button type="button" onClick={() => setAudioTab('record')} className={`px-4 py-2 text-sm font-medium ${audioTab === 'record' ? 'border-b-2 border-stone-800 text-stone-800' : 'text-stone-500'}`}>Record Audio</button>
                                <button type="button" onClick={() => setAudioTab('upload')} className={`px-4 py-2 text-sm font-medium ${audioTab === 'upload' ? 'border-b-2 border-stone-800 text-stone-800' : 'text-stone-500'}`}>Upload Audio</button>
                            </div>
                            {/* ... (rest of Step 2 JSX is unchanged) ... */}
                            {audioTab === 'record' && (
                              <div className="space-y-6">
                                <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-600 flex gap-3">
                                  <Info size={20} className="flex-shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="font-semibold text-stone-800 mb-2">Conversation Starters:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      <li>Tell me about a childhood memory that still brings you joy.</li>
                                      <li>What traditions or meals were important in your family?</li>
                                      <li>What advice would you give to the next generation?</li>
                                    </ul>
                                  </div>
                                </div>
                                <AudioRecorder onRecordingComplete={setAudioFile} />
                              </div>
                            )}

                            {audioTab === 'upload' && (
                               <div className="text-center py-12 border border-dashed border-stone-300 rounded-lg">
                                    <Upload size={40} className="mx-auto text-stone-400 mb-4"/>
                                    <p className="text-stone-500 mb-4">Upload an audio file from your computer.</p>
                                    <label htmlFor="audio-upload-main" className="p-3 px-6 rounded-lg bg-stone-800 text-white hover:bg-stone-900 cursor-pointer transition-colors font-semibold">
                                        Choose File
                                        <input id="audio-upload-main" type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files[0])}/>
                                    </label>
                                </div>
                            )}

                             {audioFile && (
                                <div className="mt-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3 text-sm">
                                    <CheckCircle size={20} />
                                    <span>File ready: <strong>{audioFile.name}</strong></span>
                                </div>
                            )}
                          </div>
                        )}

                        {/* Step 3: Add Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="storyTitle" className="block text-sm font-medium text-stone-700 mb-1">Story Title <span className="text-red-500">*</span></label>
                                    <input type="text" id="storyTitle" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">What is this story about? <span className="text-red-500">*</span></label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <button type="button" key={tag} onClick={() => handleTagClick(tag)} className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${selectedTags.includes(tag) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'}`}>{tag}</button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <input type="text" value={customTag} onChange={(e) => setCustomTag(e.target.value)} placeholder="Add your own tag" className="flex-grow p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500" />
                                        <button type="button" onClick={handleAddCustomTag} className="p-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-stone-700 mb-1">Location <span className="text-red-500">*</span></label>
                                    <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Oaxaca, Mexico" className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500" required />
                                </div>
                                <div>
                                    <label htmlFor="summary" className="block text-sm font-medium text-stone-700 mb-1">Describe the story or add notes <span className="text-stone-500">(Optional)</span></label>
                                    <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows="4" className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"></textarea>
                                </div>
                            </div>
                        )}
                        
                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                          <div className="space-y-4 text-stone-700">
                            {audioPreviewUrl && (
                                <div className="bg-stone-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-stone-600 mb-2">Listen to your recording:</p>
                                    <audio src={audioPreviewUrl} controls className="w-full" />
                                </div>
                            )}
                            <h4 className="text-lg font-semibold text-stone-800 border-b border-stone-200 pb-2 pt-4">Please review your story details:</h4>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Title:</strong> <span className="text-right">{storyTitle || 'Not provided'}</span></div>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Speaker:</strong> <span className="text-right">{speakerName || 'Not provided'}</span></div>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Age:</strong> <span className="text-right">{speakerAge || 'Not provided'}</span></div>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Pronouns:</strong> <span className="text-right">{speakerPronouns || 'Not provided'}</span></div>
                             <div className="flex justify-between py-2 items-center"><strong className="font-medium text-stone-500">Photo:</strong> {photoPreviewUrl ? <img src={photoPreviewUrl} alt="Speaker preview" className="w-16 h-16 rounded-lg object-cover" /> : 'None'}</div>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Audio File:</strong> <span className="text-right truncate">{audioFile?.name || 'No file selected'}</span></div>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Tags:</strong> <span className="text-right">{selectedTags.join(', ') || 'None'}</span></div>
                             <div className="flex justify-between py-2"><strong className="font-medium text-stone-500">Location:</strong> <span className="text-right">{location || 'None'}</span></div>
                             <div className="py-2"><strong className="font-medium text-stone-500">Summary:</strong> <p className="mt-1 text-stone-600">{summary || 'None'}</p></div>
                          </div>
                        )}

                        {/* --- Navigation Buttons --- */}
                        <div className="pt-8 border-t border-stone-200 mt-8 flex justify-between items-center">
                            <button type="button" onClick={handleBack} className={`p-3 rounded-lg flex items-center justify-center gap-2 bg-white text-stone-800 border border-stone-300 hover:bg-stone-100 transition-all font-semibold ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                                <ArrowLeft size={20}/> Back
                            </button>
                           {currentStep < steps.length ? (
                                <button type="button" onClick={handleNext} disabled={!isStepValid} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-stone-800 text-white transition-all font-semibold disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-stone-900">
                                    Next <ArrowRight size={20}/>
                                </button>
                           ) : (
                                <button type="submit" disabled={!isSubmittable} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white transition-all font-semibold disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-green-700">
                                    Submit Story <CheckCircle size={20}/>
                                </button>
                           )}
                        </div>
                      </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
