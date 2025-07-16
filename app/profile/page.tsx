"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

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
import { Camera, X, Check, ArrowUp, ArrowDown, Dot, AlertTriangle, Edit, Save, UploadCloud } from 'lucide-react';

export default function ProfilePage() {
    const { user, isLoading, updateUserProfile } = useAuth();
    const router = useRouter();
    
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for managing edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [objectPosition, setObjectPosition] = useState('object-center');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State and refs for camera functionality
    const [isChangingPhoto, setIsChangingPhoto] = useState(false); // ✨ NEW state to manage photo options
    const [photoSource, setPhotoSource] = useState<'upload' | 'camera'>('upload');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Set initial editing state when user data loads
    useEffect(() => {
        if (user) {
            setNewName(user.displayName || '');
            setObjectPosition(user.photoPosition || 'object-center');
        }
    }, [user]);

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

// ✨ NEW: This useEffect hook now manages the video stream
useEffect(() => {
    if (stream && videoRef.current) {
        // When the stream state is ready, attach it to the video element
        videoRef.current.srcObject = stream;
    }
    // Cleanup function to stop the camera when the component unmounts or stream is cleared
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
}, [stream]);

// ✨ NEW: Simplified function just sets the stream state to null
const stopCameraStream = () => {
    setStream(null);
};

// ✨ NEW: Simplified function just gets permission and sets the stream
const startCamera = async () => {
    setNewPhoto(null);
    setPhotoPreviewUrl(null);
    setPhotoSource('camera');
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
    } catch (err) {
        console.error("Error accessing camera:", err);
        toast.error("Could not access camera. Please check permissions.");
        setPhotoSource('upload');
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
            const newFile = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
            setNewPhoto(newFile);
            setPhotoPreviewUrl(URL.createObjectURL(newFile));
            setIsChangingPhoto(false);
        }
    }, 'image/jpeg');
    stopCameraStream(); 
};

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        stopCameraStream();
        setPhotoSource('upload');
        const file = e.target.files?.[0];
        if (file) {
            setNewPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
            setIsChangingPhoto(false);
        }
    };
    
    const cancelEdit = () => {
        setIsEditing(false);
        setNewPhoto(null);
        setPhotoPreviewUrl(null);
        setIsChangingPhoto(false);
        stopCameraStream();
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


    if (isLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading Profile...</div>;
    }

    return (
        <>
            <div className="bg-stone-50 min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="relative mb-12 p-8 bg-white rounded-xl border border-stone-200">
                        {isEditing ? (
                            <div className="animate-fade-in">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="w-32 h-32 relative group flex-shrink-0 bg-stone-100 rounded-full">
                                        {(photoPreviewUrl || user.photoURL) && !stream && (
                                            <Image src={photoPreviewUrl || user.photoURL || '/default-image.png'} alt="Profile photo preview" width={128} height={128} className={`rounded-full object-cover aspect-square ${objectPosition}`} />
                                        )}
                                        {stream && (<video ref={videoRef} autoPlay muted className="w-full h-full rounded-full object-cover" />)}
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                    <div className="flex-grow w-full">
                                        <label htmlFor="displayName" className="block text-sm font-medium text-stone-700">Display Name</label>
                                        <input id="displayName" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-2 text-3xl font-serif border-b-2 border-stone-200 focus:border-amber-500 focus:outline-none bg-transparent" />
                                        <div className="mt-4">
                                            {!isChangingPhoto && !newPhoto && (
                                                <button onClick={() => setIsChangingPhoto(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200">
                                                    <Camera size={14}/> Change Photo
                                                </button>
                                            )}

                                            {isChangingPhoto && (
                                                <div className="flex items-center gap-2 animate-fade-in">
                                                    <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} className="hidden" accept="image/*" />
                                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200"><UploadCloud size={14}/> Upload File</button>
                                                    <button onClick={startCamera} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200"><Camera size={14}/> Use Camera</button>
                                                    <button onClick={() => setIsChangingPhoto(false)} className="p-1.5 text-stone-500 hover:text-stone-800"><X size={16}/></button>
                                                </div>
                                            )}

                                            {stream && (
                                                <div className="mt-2 animate-fade-in">
                                                    <button onClick={takePicture} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"><Camera size={16}/> Snap Photo</button>
                                                </div>
                                            )}

                                            {newPhoto && !stream && (
                                                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg max-w-min animate-fade-in">
                                                    <button onClick={() => setObjectPosition('object-top')} title="Align Top" className={`p-1 rounded-md ${objectPosition === 'object-top' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><ArrowUp size={16}/></button>
                                                    <button onClick={() => setObjectPosition('object-center')} title="Align Center" className={`p-1 rounded-md ${objectPosition === 'object-center' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><Dot size={16}/></button>
                                                    <button onClick={() => setObjectPosition('object-bottom')} title="Align Bottom" className={`p-1 rounded-md ${objectPosition === 'object-bottom' ? 'bg-stone-800 text-white' : 'hover:bg-stone-200'}`}><ArrowDown size={16}/></button>
                                                </div>
                                            )}
                                        </div>
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
                            <>
                                <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors">
                                    <Edit size={14} /> Edit Profile
                                </button>
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <Image src={user.photoURL || '/default-image.png'} alt={user.displayName || 'User'} width={128} height={128} className={`rounded-full object-cover aspect-square border-4 border-white shadow-md ${user.photoPosition || 'object-center'}`} />
                                    <div className="text-center sm:text-left flex-grow">
                                        <h1 className="text-4xl font-serif text-stone-900">{user.displayName}</h1>
                                        <p className="mt-1 text-lg text-stone-500">{user.email}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </header>

                    <section>
                       <h2 className="text-2xl font-serif text-stone-900 mb-6">My Submitted Stories</h2>
                        {isFetching ? (
                            <p className="text-stone-600">Loading your stories...</p>
                        ) : myStories.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {myStories.map(story => (
                                    <StoryCard key={story.id} {...story} />
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
            
        </>
    );
}