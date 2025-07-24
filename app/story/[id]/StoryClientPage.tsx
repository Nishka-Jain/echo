"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// App-specific hooks and components
import { useAuth } from '@/app/context/AuthContext';
import type { Story } from '@/lib/types';

// Firebase imports
import { db, storage } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";

// Icon imports
import { MapPin, Tag, UserCircle, Calendar, AlertTriangle, Edit, Loader2, Languages } from 'lucide-react';

const DynamicAudioPlayer = dynamic(
    () => import('@/app/components/CustomAudioPlayer'),
    { 
      ssr: false, 
      loading: () => <div className="w-full h-[56px] bg-stone-900 animate-pulse rounded-lg flex items-center justify-center text-stone-500">Loading Player...</div>
    }
  );
  
// --- Local Components ---
const DeleteConfirmationModal = ({ story, onConfirm, onCancel, isDeleting }: { story: Story; onConfirm: () => void; onCancel: () => void; isDeleting: boolean; }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-4 text-2xl font-serif text-stone-900">Delete Story</h3>
                <div className="mt-2 text-stone-600">
                    <p>Are you sure you want to permanently delete this story?</p>
                    <p className="font-semibold mt-1">"{story.title}"</p>
                    <p className="mt-4 text-sm text-stone-500">This action cannot be undone.</p>
                </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
                <button onClick={onCancel} disabled={isDeleting} className="px-4 py-2 rounded-lg border border-stone-300 font-semibold hover:bg-stone-100 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-red-300 transition-colors">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);


const formatStoryDate = (story: Story): string | null => {
    if (story.dateType === 'year' && story.specificYear) return story.specificYear.toString();
    if (story.dateType === 'period') {
        if (story.startYear && story.endYear) {
            if (story.startYear === story.endYear) return story.startYear.toString();
            return `${story.startYear} - ${story.endYear}`;
        }
        if (story.startYear) return `From ${story.startYear}`;
    }
    return null;
};

export default function StoryClientPage({ story }: { story: Story | null }) {
    const { user } = useAuth();
    const router = useRouter();

    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [translationStatus, setTranslationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    
    // Check if the current user is the author of the story
    const isAuthor = user && story && user.uid === story.authorId;

    if (!story) {
        return (
            <div className="flex items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-4xl font-serif text-stone-800">Story Not Found</h1>
                <p className="mt-4 text-lg text-stone-600">Sorry, we couldn't find the story you were looking for.</p>
                <Link href="/explore" className="mt-6 inline-block text-lg font-semibold text-amber-700 hover:text-amber-800">
                    ← Back to Explore
                </Link>
            </div>
        );
    }

    const handleDelete = async () => {
        if (!story) return;
        setIsDeleting(true);
        const toastId = toast.loading("Deleting story...");
        try {
            if (story.photoUrl) await deleteObject(ref(storage, story.photoUrl));
            if (story.audioUrl) await deleteObject(ref(storage, story.audioUrl));
            
            await deleteDoc(doc(db, "stories", story.id));
            
            toast.success("Story deleted successfully!", { id: toastId });
            router.push('/profile');
        } catch (error) {
            console.error("Error deleting story:", error);
            toast.error("Failed to delete story.", { id: toastId });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };
    
    const handleTranslate = async () => {
        if (!story.transcription || story.transcription === 'No transcription was provided for this story.') {
            alert("There is no transcription available to translate.");
            return;
        }
        setTranslationStatus('generating');
        setTranslatedText('');
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: story.transcription, targetLanguage }),
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
    
    
    const storyOccurrenceDate = formatStoryDate(story);
    const submissionDate = story.createdAt 
        ? new Date(story.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;

    return (
        <>
            <div className="bg-white min-h-screen text-stone-800 font-sans">
                <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <Link href="/" className="text-2xl font-bold text-stone-900 tracking-tighter">Echo</Link>
                            <Link href="/explore" className="text-stone-600 hover:text-stone-900 transition-colors text-base font-semibold">
                                ← Back to Explore
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    
                    {isAuthor && (
                        <div className="absolute top-12 right-4 flex items-center gap-2 z-20">
                             <Link href={`/story/${story.id}/edit`} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors">
                                <Edit size={14} /> Edit
                            </Link>
                            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                Delete
                            </button>
                        </div>
                    )}

                    <article>
                    <header className="mb-12 border-b border-stone-200 pb-8">
                            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 tracking-tight">{story.title}</h1>
                            
                            <div className="mt-6 flex items-center gap-2 text-lg text-stone-600">
                                <UserCircle size={20} />
                                <span>
                                    <span className="font-semibold">{story.speaker}</span>
                                    {story.age && <span className="font-normal">, {story.age}</span>}
                                    {story.pronouns && <span className="font-normal text-stone-500 ml-2">({story.pronouns})</span>}
                                </span>
                            </div>
                            
                            {/* ✨ FIX: This block contains the new layout for metadata */}
                            <div className="mt-6 space-y-2 text-sm">
                                {/* Flex container for Occurred date and Location */}
                                <div className="flex justify-between items-center">
                                    {storyOccurrenceDate && (
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <Calendar size={16} />
                                            <p><span className="font-semibold text-stone-800">Occurred:</span> {storyOccurrenceDate}</p>
                                        </div>
                                    )}
                                    {story.location?.name && (
                                        <div className="flex items-center gap-2 text-stone-500">
                                            <MapPin size={16} />
                                            <span>{story.location.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>
                        
                        <div className="space-y-8">
                            {/* The photo is only rendered if it exists */}
                            {story.photoUrl && (
                                <div className="w-full max-w-md mx-auto"> {/* Optionally add max-w-md and mx-auto for better centering of smaller images */}
                                    <Image src={story.photoUrl} alt={story.title} width={100} height={100} className="rounded-lg object-cover w-full shadow-md" />
                                </div>
                            )}

                            {/* The audio player section */}
                            <div className="bg-stone-50 rounded-lg p-6 border border-stone-200">
                                <h3 className="font-semibold text-stone-800 mb-3">Listen to the Story</h3>
                                {story.audioUrl ? (
                                    <DynamicAudioPlayer src={story.audioUrl} />
                                ) : (
                                    <p className="text-stone-500">No audio was uploaded for this story.</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-12 prose prose-lg max-w-none prose-stone">
                            <p>{story.excerpt}</p>
                        </div>

                        {story.tags && story.tags.length > 0 && (
                            <div className="mt-12 border-t border-stone-200 pt-8">
                                <div className="flex flex-wrap gap-2 items-center">
                                <Tag size={16} className="text-stone-500"/>
                                {story.tags.map(tag => ( <span key={tag} className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">{tag}</span> ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-12 border-t border-stone-200 pt-8">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-serif font-semibold text-stone-800 mb-4">Transcription</h2>
                                    <div className="prose prose-stone max-w-none bg-stone-50 p-6 rounded-lg whitespace-pre-wrap">
                                        <p>{story.transcription || 'No transcription was provided for this story.'}</p>
                                    </div>
                                </div>
                                {story.transcription && story.transcription !== 'No transcription was provided for this story.' && (
                                    <div className="pt-6 border-t border-stone-200 space-y-4">
                                        <h3 className="text-xl font-serif font-semibold text-stone-800">Translate Transcription</h3>
                                        <div className="flex items-center gap-4">
                                            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg bg-white">
                                                <option>Arabic</option><option>Bengali</option><option>Cantonese</option><option>Czech</option><option>Danish</option><option>Dutch</option><option>English</option><option>Filipino</option><option>Finnish</option><option>French</option><option>German</option><option>Greek</option><option>Gujarati</option><option>Hebrew</option><option>Hindi</option><option>Hungarian</option><option>Indonesian</option><option>Italian</option><option>Japanese</option><option>Kannada</option><option>Korean</option><option>Malay</option><option>Mandarin Chinese</option><option>Marathi</option><option>Norwegian</option><option>Persian (Farsi)</option><option>Polish</option><option>Portuguese</option><option>Punjabi</option><option>Romanian</option><option>Russian</option><option>Spanish</option><option>Swahili</option><option>Swedish</option><option>Tamil</option><option>Telugu</option><option>Thai</option><option>Turkish</option><option>Ukrainian</option><option>Urdu</option><option>Vietnamese</option>
                                            </select>
                                            <button type="button" onClick={handleTranslate} disabled={translationStatus === 'generating'} className="p-3 px-6 rounded-lg flex items-center justify-center gap-2 bg-blue-600 text-white transition-all font-semibold disabled:bg-blue-300 hover:bg-blue-700">
                                                {translationStatus === 'generating' ? <Loader2 size={20} className="animate-spin" /> : <Languages size={20} />} Translate
                                            </button>
                                        </div>
                                        {translationStatus === 'generating' && (<div className="mt-2 p-4 bg-stone-50 rounded-lg flex items-center gap-3 text-stone-600"><Loader2 size={20} className="animate-spin" /><p>Translating...</p></div>)}
                                        {translationStatus === 'success' && (<div className="prose prose-stone max-w-none bg-stone-50 p-6 rounded-lg whitespace-pre-wrap"><p>{translatedText}</p></div>)}
                                        {translationStatus === 'error' && (<p className="mt-2 text-red-600 p-4 bg-red-50 rounded-lg">Could not translate text.</p>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    {submissionDate && (
                        <footer className="mt-16 pt-8 border-t border-stone-200 text-sm text-stone-500 text-center">
                            <p>Story submitted to the Echo Archive on {submissionDate}.</p>
                        </footer>
                    )}
                    </article>
                </main>
            </div>
            {showDeleteModal && story && (
                <DeleteConfirmationModal
                    story={story}
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
}