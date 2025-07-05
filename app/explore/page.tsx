"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, Map, List, Mic } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from '@/app/components/Navbar';

// Shared types and components are now imported
import type { Story } from '@/lib/types';
import StoryCard from '@/app/components/StoryCard'; 

const StoryMap = dynamic(() => import('@/app/components/StoryMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-stone-200 rounded-xl flex items-center justify-center"><p>Loading map...</p></div>
});

const popularTags = ['Family', 'Tradition', 'Migration', 'Childhood', 'Community', 'Work', 'Hope', 'New York'];

export default function ExplorePage() {
    const [allStories, setAllStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const storiesCollection = collection(db, "stories");
                const q = query(storiesCollection, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const storiesData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || 'Untitled Story',
                        speaker: data.speaker || 'Unknown Speaker',
                        age: data.age,
                        pronouns: data.pronouns,
                        excerpt: data.summary || 'No summary available.',
                        photoUrl: data.photoUrl,
                        tags: data.tags || [],
                        location: data.location,
                    } as Story;
                });
                setAllStories(storiesData);
            } catch (error) {
                console.error("Error fetching stories: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStories();
    }, []);

    const filteredStories = useMemo(() => {
        return allStories.filter(story => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (story.title?.toLowerCase().includes(searchLower) || story.speaker?.toLowerCase().includes(searchLower));
            const matchesTag = activeTag ? story.tags?.includes(activeTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [searchTerm, activeTag, allStories]);

    return (
        <div className="bg-white min-h-screen text-stone-800 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-stone-900">Explore Stories</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">Discover a living archive of voices, memories, and wisdom from around the world.</p>
                    
                    <div className="flex items-center justify-center bg-stone-100 border border-stone-200 rounded-lg p-1 mt-8 max-w-min mx-auto">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600 hover:bg-stone-200/50'}`}>
                            <List className="h-5 w-5" />
                            <span>List</span>
                        </button>
                        <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600 hover:bg-stone-200/50'}`}>
                            <Map className="h-5 w-5" />
                            <span>Map</span>
                        </button>
                    </div>
                </header>
                
                <div className="bg-white p-4 mb-8 rounded-xl w-full max-w-6xl mx-auto border border-stone-200 shadow-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search by title, speaker, or tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-2 pb-1 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTag(null)}
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${!activeTag ? 'bg-stone-800 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
                        >
                            All
                        </button>
                        {popularTags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${activeTag === tag ? 'bg-stone-800 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    {isLoading ? (
                        <div className="text-center py-24">
                            <p className="text-lg text-stone-600">Loading stories from the archive...</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' && (
                                <div className="animate-fade-in">
                                    {filteredStories.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                            {filteredStories.map(story => (
                                                <StoryCard key={story.id} {...story} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-24 border-2 border-dashed border-stone-300 rounded-xl">
                                            <h3 className="text-2xl font-serif text-stone-800">No Stories Found</h3>
                                            <p className="mt-4 text-stone-600">There are no stories that match your search, or none have been submitted yet.</p>
                                            <Link href="/submit" className="mt-6 inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-stone-900 transition-all shadow-md">
                                                <Mic size={20} /> Be the First to Record a Memory
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {viewMode === 'map' && (
                                <div className="animate-fade-in">
                                    <div className="h-[75vh] w-full max-w-6xl mx-auto rounded-xl overflow-hidden">
                                        <StoryMap stories={filteredStories} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}