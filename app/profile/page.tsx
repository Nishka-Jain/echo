"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// App-specific hooks and components
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';
import StoryCard from '@/app/components/StoryCard';
import type { Story } from '@/lib/types';

// Firebase imports
import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";

// Icon imports
import { Camera, X, Check, ArrowUp, ArrowDown, Dot } from 'lucide-react';

export default function ProfilePage() {
    const { user, isLoading, updateUserProfilePhoto } = useAuth();
    const router = useRouter();
    
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    // State for photo uploading
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [objectPosition, setObjectPosition] = useState('object-center');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effect to redirect if user is not logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    // Effect to fetch user's stories
    useEffect(() => {
        if (user) {
            const fetchMyStories = async () => {
                setIsFetching(true);
                try {
                    const storiesCollection = collection(db, "stories");
                    // Query for stories where 'authorId' matches the current user's UID
                    const q = query(
                        storiesCollection, 
                        where("authorId", "==", user.uid),
                        orderBy("createdAt", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    
                    const storiesData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Story[];

                    setMyStories(storiesData);
                } catch (error) {
                    console.error("Error fetching user stories:", error);
                } finally {
                    setIsFetching(false);
                }
            };
            fetchMyStories();
        }
    }, [user]);

    // Handlers for photo updating
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePhotoUpload = async () => {
        if (!newPhoto) return;
        setIsUploading(true);
        try {
            await updateUserProfilePhoto(newPhoto, objectPosition);
            alert("Profile photo updated successfully!");
            setNewPhoto(null);
            setPhotoPreviewUrl(null);
        } catch (error) {
            console.error("Error updating profile photo:", error);
            alert("Failed to update photo. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const cancelPhotoUpload = () => {
        setNewPhoto(null);
        setPhotoPreviewUrl(null);
        setObjectPosition('object-center');
    };

    // Handler for deleting a story
    const handleDelete = async (storyToDelete: Story) => {
        if (!window.confirm("Are you sure you want to permanently delete this story? This action cannot be undone.")) {
            return;
        }

        try {
            if (storyToDelete.photoUrl) {
                const photoRef = ref(storage, storyToDelete.photoUrl);
                await deleteObject(photoRef);
            }
            if (storyToDelete.audioUrl) {
                const audioRef = ref(storage, storyToDelete.audioUrl);
                await deleteObject(audioRef);
            }
            await deleteDoc(doc(db, "stories", storyToDelete.id));
            setMyStories(currentStories => currentStories.filter(story => story.id !== storyToDelete.id));
            alert("Story deleted successfully.");
        } catch (error) {
            console.error("Error deleting story:", error);
            alert("There was an error deleting your story. Please try again.");
        }
    };

    if (isLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading Profile...</div>;
    }

    return (
        <div className="bg-stone-50 min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12 p-8 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group">
                        <Image
                            src={photoPreviewUrl || user.photoURL || '/default-image.png'}
                            alt={user.displayName || 'User'}
                            width={128}
                            height={128}
                            className={`rounded-full object-cover aspect-square border-4 border-white shadow-md ${
                                newPhoto ? objectPosition : (user.photoPosition || 'object-center')
                            }`}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoSelect}
                            className="hidden"
                            accept="image/png, image/jpeg"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md hover:bg-stone-100 transition-colors opacity-50 group-hover:opacity-100"
                            title="Change profile photo"
                        >
                            <Camera size={20} className="text-stone-600"/>
                        </button>
                    </div>
                    <div className="text-center sm:text-left flex-grow">
                        <h1 className="text-4xl font-serif text-stone-900">{user.displayName}</h1>
                        <p className="mt-1 text-lg text-stone-500">{user.email}</p>
                        
                        {newPhoto && (
                            <div className="mt-4 border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
                                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
                                    <button onClick={() => setObjectPosition('object-top')} title="Align Top" className={`p-1 rounded-md ${objectPosition === 'object-top' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><ArrowUp size={16}/></button>
                                    <button onClick={() => setObjectPosition('object-center')} title="Align Center" className={`p-1 rounded-md ${objectPosition === 'object-center' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><Dot size={16}/></button>
                                    <button onClick={() => setObjectPosition('object-bottom')} title="Align Bottom" className={`p-1 rounded-md ${objectPosition === 'object-bottom' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><ArrowDown size={16}/></button>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button onClick={handlePhotoUpload} disabled={isUploading} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-stone-300 flex items-center gap-2">
                                        <Check size={16}/> {isUploading ? 'Uploading...' : 'Save'}
                                    </button>
                                    <button onClick={cancelPhotoUpload} className="p-2 text-stone-500 hover:text-stone-800"><X size={20}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <section>
                   <h2 className="text-2xl font-serif text-stone-900 mb-6">My Submitted Stories</h2>
                    {isFetching ? (
                        <p className="text-stone-600">Loading your stories...</p>
                    ) : myStories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myStories.map(story => (
                                <div key={story.id} className="flex flex-col gap-2">
                                    <StoryCard {...story} />
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/story/${story.id}/edit`} className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors px-3 py-1 rounded-md bg-stone-100 hover:bg-stone-200">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(story)} className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors px-3 py-1 rounded-md">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center border-2 border-dashed rounded-xl p-12">
                            <p className="text-stone-600">You haven't submitted any stories yet.</p>
                            <Link href="/submit" className="mt-4 inline-block text-amber-700 font-semibold">Submit your first story</Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}