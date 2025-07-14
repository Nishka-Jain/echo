"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';
import StoryCard from '@/app/components/StoryCard';
import type { Story } from '@/lib/types';

import { db, storage } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";

import { Camera, X, Check, ArrowUp, ArrowDown, Dot, AlertTriangle, Edit, Save } from 'lucide-react';

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

export default function ProfilePage() {
    const { user, isLoading, updateUserProfile } = useAuth();
    const router = useRouter();
    
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [objectPosition, setObjectPosition] = useState('object-center');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setNewName(user.displayName || '');
            setObjectPosition(user.photoPosition || 'object-center');
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            const fetchMyStories = async () => {
                setIsFetching(true);
                try {
                    const storiesCollection = collection(db, "stories");
                    const q = query(storiesCollection, where("authorId", "==", user.uid), orderBy("createdAt", "desc"));
                    const querySnapshot = await getDocs(q);
                    const storiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[];
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

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const cancelEdit = () => {
        setIsEditing(false);
        setNewPhoto(null);
        setPhotoPreviewUrl(null);
        if(user) {
            setNewName(user.displayName || '');
            setObjectPosition(user.photoPosition || 'object-center');
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;
        setIsUpdating(true);
        const toastId = toast.loading("Saving profile...");
        
        try {
            await updateUserProfile({
                displayName: newName.trim() !== user.displayName ? newName.trim() : undefined,
                newPhoto: newPhoto,
                photoPosition: objectPosition
            });

            toast.success("Profile updated successfully!", { id: toastId });
            setIsEditing(false);
            setNewPhoto(null);
            setPhotoPreviewUrl(null);

        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!storyToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading("Deleting story...");
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
            toast.success("Story deleted successfully!", { id: toastId });
            setMyStories(currentStories => currentStories.filter(story => story.id !== storyToDelete.id));
        } catch (error) {
            console.error("Error deleting story:", error);
            toast.error("Failed to delete story.", { id: toastId });
        } finally {
            setIsDeleting(false);
            setStoryToDelete(null);
        }
    };

    if (isLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading Profile...</div>;
    }

    return (
        <>
            <div className="bg-white min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className=" relative mb-12 p-8 bg-white rounded-xl border border-stone-200">
                        {isEditing ? (
                            <div className="animate-fade-in">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <Image src={photoPreviewUrl || user.photoURL || '/default-image.png'} alt="Profile photo preview" width={128} height={128} className={`rounded-full object-cover aspect-square border-4 border-white shadow-md ${objectPosition}`} />
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} className="hidden" accept="image/*" />
                                        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md hover:bg-stone-100"><Camera size={20} className="text-stone-600"/></button>
                                    </div>
                                    <div className="flex-grow w-full">
                                        <label htmlFor="displayName" className="block text-sm font-medium text-stone-700">Display Name</label>
                                        <input id="displayName" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2 text-3xl font-serif border-b-2 border-stone-200 focus:border-amber-500 focus:outline-none" />
                                        {newPhoto && (
                                            <div className="mt-4 flex items-center gap-1 p-1 bg-stone-100 rounded-lg max-w-min">
                                                <button onClick={() => setObjectPosition('object-top')} title="Align Top" className={`p-1 rounded-md ${objectPosition === 'object-top' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><ArrowUp size={16}/></button>
                                                <button onClick={() => setObjectPosition('object-center')} title="Align Center" className={`p-1 rounded-md ${objectPosition === 'object-center' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><Dot size={16}/></button>
                                                <button onClick={() => setObjectPosition('object-bottom')} title="Align Bottom" className={`p-1 rounded-md ${objectPosition === 'object-bottom' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><ArrowDown size={16}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-4">
                                    <button onClick={cancelEdit} disabled={isUpdating} className="px-4 py-2 text-sm font-semibold rounded-lg border border-stone-300 hover:bg-stone-100">Cancel</button>
                                    <button onClick={handleProfileUpdate} disabled={isUpdating} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-stone-300 flex items-center gap-2">
                                        <Save size={16} /> {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <Image src={user.photoURL || '/default-image.png'} alt={user.displayName || 'User'} width={128} height={128} className={`rounded-full object-cover aspect-square border-4 border-white shadow-md ${user.photoPosition || 'object-center'}`} />
                                <div className="text-center sm:text-left flex-grow">
                                    <h1 className="text-4xl font-serif text-stone-900">{user.displayName}</h1>
                                    <p className="mt-1 text-lg text-stone-500">{user.email}</p>
                                </div>
                                <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors">
                                    <Edit size={16} /> Edit Profile
                                </button>
                            </div>
                        )}
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
                                            <button onClick={() => setStoryToDelete(story)} className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors px-3 py-1 rounded-md">
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
            
            {storyToDelete && (
                <DeleteConfirmationModal
                    story={storyToDelete}
                    onCancel={() => setStoryToDelete(null)}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
}