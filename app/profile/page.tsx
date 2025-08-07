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
                    
                    const storiesData = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            title: data.title || 'Untitled Story',
                            speaker: data.speaker || 'Unknown Speaker',
                            age: data.age,
                            pronouns: data.pronouns,
                            summary: data.summary || 'No summary available.',
                            photoUrl: data.photoUrl,
                            tags: data.tags || [],
                            location: data.location,
                            // ✨ These fields fix the time period issue
                            dateType: data.dateType,
                            startYear: data.startYear,
                            endYear: data.endYear,
                            specificYear: data.specificYear,
                            transcription: data.transcription,
                            language: data.language,
                            createdAt: data.createdAt?.toDate().toISOString(),
                            authorId: data.authorId
                        } as Story;
                    });

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
            <div className="bg-white min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12 py-12">
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
                            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-6">
                                {/* Profile Info Block */}
                                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-8">
                                    <Image 
                                        src={user.photoURL || '/default-image.png'} 
                                        alt={user.displayName || 'User'} 
                                        width={128} height={128} 
                                        className={`flex-shrink-0 rounded-full object-cover aspect-square border-4 border-white shadow-md ${user.photoPosition || 'object-center'}`} 
                                    />
                                    <div className="flex-grow">
                                        <h1 className="text-4xl font-serif text-stone-900">{user.displayName}</h1>
                                        <p className="mt-1 text-lg text-stone-500">{user.email}</p>
                                    </div>
                                </div>
                                
                                {/* Edit Button */}
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                                >
                                    <Edit size={14} /> Edit Profile
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
                <footer className="bg-stone-900 text-stone-300">
                    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                        
                        <Link href="/" className="text-2xl font-bold text-white">
                        Echo
                        </Link>
                        
                        <p className="mt-4 text-stone-400 max-w-md mx-auto">
                        Hold onto the stories that hold us together.
                        </p>

                        {/* All Links & Socials Container */}
                        <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 text-sm font-medium">
                        
                        {/* Navigation Links Group */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-stone-300">
                            {footerLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                                {link.label}
                            </Link>
                            ))}
                        </div>
                            
                        {/* Visual Separator for Desktop Only */}
                        <div className="h-4 w-px bg-stone-700 hidden md:block"></div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-5">
                            {socialLinks.map((social) => (
                            <a 
                                key={social.href}
                                href={social.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={social.label}
                                className="text-stone-400 hover:text-white transition-colors"
                            >
                                {social.icon}
                            </a>
                            ))}
                        </div>
                        </div>
                        
                        <p className="mt-10 text-xs text-stone-500">
                        &copy; {new Date().getFullYear()} Echo. All rights reserved.
                        </p>

                    </div>
                    </footer>
            </div>
            
        </>
    );
}