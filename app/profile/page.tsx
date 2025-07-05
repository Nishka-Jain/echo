"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import StoryCard from '@/app/components/StoryCard'; // We can reuse your StoryCard
import Navbar from '@/app/components/Navbar';
import { doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { storage } from '@/lib/firebase'; // We need 'storage' now, not just 'db'

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    const handleDelete = async (storyToDelete: Story) => {
        // 1. Confirm with the user before deleting
        if (!window.confirm("Are you sure you want to permanently delete this story? This action cannot be undone.")) {
            return;
        }
    
        try {
            // 2. Delete files from Firebase Storage if they exist
            if (storyToDelete.photoUrl) {
                const photoRef = ref(storage, storyToDelete.photoUrl);
                await deleteObject(photoRef);
            }
            if (storyToDelete.audioUrl) {
                const audioRef = ref(storage, storyToDelete.audioUrl);
                await deleteObject(audioRef);
            }
    
            // 3. Delete the document from Firestore
            await deleteDoc(doc(db, "stories", storyToDelete.id));
    
            // 4. Update the UI by removing the story from the local state
            setMyStories(currentStories => currentStories.filter(story => story.id !== storyToDelete.id));
    
            alert("Story deleted successfully.");
    
        } catch (error) {
            console.error("Error deleting story:", error);
            alert("There was an error deleting your story. Please try again.");
        }
    };

    useEffect(() => {
        // If auth is done loading and there's no user, redirect to homepage
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        // Fetch stories only if a user is logged in
        if (user) {
            const fetchMyStories = async () => {
                try {
                    const storiesCollection = collection(db, "stories");
                    // This is the key: a query with a 'where' clause
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

    if (isLoading || isFetching) {
        return <div className="text-center py-48">Loading Profile...</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-serif text-stone-900">My Submitted Stories</h1>
                    <p className="mt-2 text-lg text-stone-600">Stories you have contributed to the archive.</p>
                </header>

                {myStories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myStories.map(story => (
                            <div key={story.id} className="flex flex-col gap-2">
                                <StoryCard {...story} />
                                <div className="flex justify-end gap-2">
                                    {/* We will implement Edit functionality later */}
                                    <button className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors px-3 py-1 rounded-md">Edit</button>
                                    {/* This button calls our new delete function */}
                                    <button 
                                        onClick={() => handleDelete(story)}
                                        className="text-sm font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors px-3 py-1 rounded-md"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You haven't submitted any stories yet.</p>
                )}
            </main>
        </div>
    );
}