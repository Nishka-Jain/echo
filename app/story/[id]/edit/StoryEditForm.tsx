"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { useAuth } from '@/app/context/AuthContext';
import type { Story } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import { APIProvider } from '@vis.gl/react-google-maps';
import LocationSearch from '@/app/components/LocationSearch';
import type { Place } from '@/app/components/LocationSearch';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { Pencil, Save, X, Plus, Camera, UploadCloud, ArrowUp, Dot, ArrowDown } from 'lucide-react';

export default function StoryEditForm({ initialStory }: { initialStory: Story }) {
    const { user, updateUserProfile } = useAuth();
    const router = useRouter();

    // State for all form fields, initialized from the story prop
    const [storyTitle, setStoryTitle] = useState(initialStory.title || '');
    const [speakerName, setSpeakerName] = useState(initialStory.speaker || '');
    const [speakerAge, setSpeakerAge] = useState(initialStory.age || '');
    const [speakerPronouns, setSpeakerPronouns] = useState(initialStory.pronouns || '');
    const [summary, setSummary] = useState(initialStory.excerpt || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialStory.tags || []);
    const [customTag, setCustomTag] = useState('');
    const [availableTags, setAvailableTags] = useState(["Family", "Migration", "Food", "Tradition", "Love", "Loss", "Childhood", "Work"]);
    const [location, setLocation] = useState<Place | null>(initialStory.location || null);
    
    // Date state
    const [dateType, setDateType] = useState<'period' | 'year'>(initialStory.dateType || 'period');
    const [startYear, setStartYear] = useState(initialStory.startYear?.toString() || '');
    const [endYear, setEndYear] = useState(initialStory.endYear?.toString() || '');
    const [specificYear, setSpecificYear] = useState(initialStory.specificYear?.toString() || '');
    
    // Photo state
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [objectPosition, setObjectPosition] = useState(user?.photoPosition || 'object-center');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading("Saving changes...");
        
        // This reference to the story document is correct
        const storyRef = doc(db, "stories", initialStory.id);
    
        try {
            let photoUrl = initialStory.photoUrl; // Start with the existing photo URL
    
            // --- NEW LOGIC ---
            // If a new photo file has been selected, upload it to Firebase Storage
            if (newPhoto) {
                // Create a unique path for the new photo in storage
                const storageRef = ref(storage, `stories/photos/${Date.now()}-${newPhoto.name}`);
                
                // Upload the file
                const uploadResult = await uploadBytes(storageRef, newPhoto);
                
                // Get the public URL of the uploaded photo
                photoUrl = await getDownloadURL(uploadResult.ref);
            }
    
            // Prepare the data object for Firestore
            const storyUpdateData = {
                title: storyTitle,
                speaker: speakerName,
                age: speakerAge,
                pronouns: speakerPronouns,
                summary: summary,
                tags: selectedTags,
                location: location,
                dateType: dateType,
                startYear: dateType === 'period' ? Number(startYear) : null,
                endYear: dateType === 'period' ? Number(endYear) : null,
                specificYear: dateType === 'year' ? Number(specificYear) : null,
                photoUrl: photoUrl, // Add the new (or existing) photo URL to the update object
            };
    
            // Update the story document in Firestore
            await updateDoc(storyRef, storyUpdateData);
            toast.success("Story updated successfully!", { id: toastId });
            router.push(`/story/${initialStory.id}`);
            router.refresh(); // Good practice to refresh server components
    
        } catch (error) {
            console.error("Error updating document: ", error);
            toast.error("Failed to update story.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-8" style={{ color: '#111' }}>
            <h1 className="text-4xl font-serif mb-8 flex items-center gap-3"><Pencil size={30}/> Edit Story</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Speaker Info */}
                <fieldset className="space-y-4 rounded-lg border p-4">
                    <legend className="text-lg font-semibold px-2">Speaker Details</legend>
                    <div>
                        <label htmlFor="speakerName">Speaker Name <span className="text-red-500">*</span></label>
                        <input id="speakerName" type="text" value={speakerName} onChange={e => setSpeakerName(e.target.value)} className="w-full mt-1 p-3 border rounded-lg text-stone-900" required style={{ color: '#111', background: '#fff', caretColor: '#111' }} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="speakerAge">Age (Optional)</label>
                            <input id="speakerAge" type="text" value={speakerAge} onChange={e => setSpeakerAge(e.target.value)} className="w-full mt-1 p-3 border rounded-lg text-stone-900" style={{ color: '#111', background: '#fff', caretColor: '#111' }} />
                        </div>
                        <div>
                            <label htmlFor="speakerPronouns">Pronouns (Optional)</label>
                            <input id="speakerPronouns" type="text" value={speakerPronouns} onChange={e => setSpeakerPronouns(e.target.value)} className="w-full mt-1 p-3 border rounded-lg text-stone-900" style={{ color: '#111', background: '#fff', caretColor: '#111' }} />
                        </div>
                    </div>
                     <div>
                        <label>Speaker Photo (Optional)</label>
                        <div className="mt-2 flex items-center gap-4">
                            <Image src={photoPreviewUrl || initialStory.photoUrl || '/default-image.png'} alt="Speaker" width={80} height={80} className={`rounded-full object-cover aspect-square ${objectPosition}`} />
                            <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="font-semibold text-sm text-amber-700 hover:underline">Change Photo</button>
                        </div>
                    </div>
                </fieldset>

                {/* Story Details */}
                <fieldset className="space-y-4 rounded-lg border p-4">
                    <legend className="text-lg font-semibold px-2">Story Details</legend>
                     <div>
                        <label htmlFor="storyTitle">Story Title <span className="text-red-500">*</span></label>
                        <input id="storyTitle" type="text" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} className="w-full mt-1 p-3 border rounded-lg text-stone-900" required />
                    </div>
                    <div>
                        <label>Tags <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2 mt-2">
                           {/* Tag selection logic here */}
                        </div>
                    </div>
                    <div>
                        <label>Location <span className="text-red-500">*</span></label>
                        <APIProvider apiKey={process.env.NEXT_PUBLIC_Maps_API_KEY!}>
                            <LocationSearch onPlaceSelect={setLocation} initialValue={location?.name} />
                        </APIProvider>
                    </div>
                     <div>
                        <label>When did this story take place? <span className="text-red-500">*</span></label>
                        <div className="mt-2 space-y-4">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDateType('period')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${dateType === 'period' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
                                >
                                    A Period of Time
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDateType('year')}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${dateType === 'year' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
                                >
                                    A Specific Year
                                </button>
                            </div>

                            {dateType === 'period' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startYear" className="text-sm">Start Year</label>
                                        <input
                                            id="startYear"
                                            type="number"
                                            placeholder="e.g., 1985"
                                            value={startYear}
                                            onChange={(e) => setStartYear(e.target.value)}
                                            className="w-full mt-1 p-3 border rounded-lg"
                                            required
                                            style={{ color: '#111', background: '#fff', caretColor: '#111' }}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="endYear" className="text-sm">End Year</label>
                                        <input
                                            id="endYear"
                                            type="number"
                                            placeholder="e.g., 1992"
                                            value={endYear}
                                            onChange={(e) => setEndYear(e.target.value)}
                                            className="w-full mt-1 p-3 border rounded-lg"
                                            required
                                            style={{ color: '#111', background: '#fff', caretColor: '#111' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {dateType === 'year' && (
                                <div>
                                    <label htmlFor="specificYear" className="text-sm">Specific Year</label>
                                    <input
                                        id="specificYear"
                                        type="number"
                                        placeholder="e.g., 2001"
                                        value={specificYear}
                                        onChange={(e) => setSpecificYear(e.target.value)}
                                        className="w-full mt-1 p-3 border rounded-lg"
                                        required
                                        style={{ color: '#111', background: '#fff', caretColor: '#111' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="summary">Story Summary</label>
                        <textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={5} className="w-full mt-1 p-3 border rounded-lg text-stone-900" style={{ color: '#111', background: '#fff', caretColor: '#111' }} />
                    </div>
                </fieldset>

                <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                    <Link href={`/story/${initialStory.id}`} className="px-6 py-2 rounded-lg border border-stone-300 font-semibold hover:bg-stone-100">Cancel</Link>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-stone-800 text-white font-semibold disabled:bg-stone-300 hover:bg-stone-900">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
