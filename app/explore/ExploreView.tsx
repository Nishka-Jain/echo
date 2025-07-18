"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, Map, List, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from '@/app/components/Navbar';
import { useSearchParams } from 'next/navigation';

// Shared types and components are now imported
import type { Story } from '@/lib/types';
import StoryCard from '@/app/components/StoryCard'; 

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

const StoryMap = dynamic(() => import('@/app/components/StoryMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-stone-200 rounded-xl flex items-center justify-center"><p>Loading map...</p></div>
});

const popularTags = ['Family', 'Tradition', 'Migration', 'Childhood', 'Community', 'Work', 'Hope', 'Food', 'Love', 'Loss'];
const storyLanguages = [
    "English", "Spanish", "French", "German", "Mandarin Chinese", "Cantonese", "Japanese", "Korean", 
    "Italian", "Portuguese", "Russian", "Arabic", "Hindi", "Bengali", "Punjabi", "Marathi",
    "Telugu", "Tamil", "Gujarati", "Kannada", "Urdu", "Persian (Farsi)", "Turkish", "Vietnamese", 
    "Thai", "Malay", "Indonesian", "Filipino", "Dutch", "Swedish", "Norwegian", "Danish", 
    "Finnish", "Greek", "Hebrew", "Polish", "Ukrainian", "Czech", "Hungarian", "Romanian", "Swahili"
].sort();

export default function ExploreView() {
    const [allStories, setAllStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    
    // --- 1. NEW STATE FOR PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    
    const searchParams = useSearchParams();
    const initialView = searchParams.get('view') === 'map' ? 'map' : 'grid';
    const [viewMode, setViewMode] = useState(initialView);
    
    // --- 2. NEW EFFECT FOR RESPONSIVE ITEMS PER PAGE ---
    // Sets items per page based on screen size (md breakpoint: 768px)
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Check on initial load
        checkScreenSize();
        // Add listener for screen resize
        window.addEventListener('resize', checkScreenSize);
        // Cleanup listener
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

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
                        speaker: data.speaker|| 'Unknown Speaker',
                        age: data.age,
                        pronouns: data.pronouns,
                        excerpt: data.summary || 'No summary available.',
                        photoUrl: data.photoUrl,
                        tags: data.tags || [],
                        location: data.location,
                        dateType: data.dateType,
                        startYear: data.startYear,
                        endYear: data.endYear,
                        specificYear: data.specificYear,
                        transcription: data.transcription,
                        createdAt: data.createdAt?.toDate().toISOString(),
                        language: data.language,
                        authorId: data.authorId
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
            const matchesSearch = searchTerm.trim() === '' ? true : (
                story.title?.toLowerCase().includes(searchLower) ||
                story.speaker?.toLowerCase().includes(searchLower) ||
                story.transcription?.toLowerCase().includes(searchLower) ||
                story.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
            const matchesTag = activeTag ? story.tags?.includes(activeTag) : true;
            const matchesLanguage = selectedLanguage ? story.language === selectedLanguage : true;

            return matchesSearch && matchesTag && matchesLanguage;
        });
    }, [searchTerm, activeTag, selectedLanguage, allStories]); 

    // --- 3. NEW DERIVED STATE AND MEMO FOR PAGINATED DATA ---
    // Set items per page: 5 for mobile, 9 for desktop
    const itemsPerPage = isMobile ? 5 : 9;

    // Reset to page 1 whenever the filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTag, selectedLanguage]);
    
    // Calculate the stories to show on the current page
    const currentStories = useMemo(() => {
        const indexOfLastStory = currentPage * itemsPerPage;
        const indexOfFirstStory = indexOfLastStory - itemsPerPage;
        return filteredStories.slice(indexOfFirstStory, indexOfLastStory);
    }, [currentPage, itemsPerPage, filteredStories]);
    
    // Calculate total pages for pagination controls
    const totalPages = Math.ceil(filteredStories.length / itemsPerPage);

    return (
        <div className="bg-white min-h-screen text-stone-800 font-sans">
            <Navbar />

            <main className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-12 py-16">
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
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative w-full md:flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title, speaker, tag, or content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="w-full md:w-auto md:max-w-xs">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="w-full px-3 pr-10 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900 appearance-none bg-no-repeat bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%236b7280%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c/polyline%3e%3c/svg%3e')] bg-[right_0.75rem_center]"
                                >
                                    <option value="">All Languages</option>
                                    {storyLanguages.sort().map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
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
                                    {/* --- 4. UPDATED RENDER LOGIC --- */}
                                    {/* Check currentStories.length instead of filteredStories.length */}
                                    {currentStories.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                                {/* Map over currentStories instead of filteredStories */}
                                                {currentStories.map(story => (
                                                    <StoryCard key={story.id} {...story} />
                                                ))}
                                            </div>
                                            
                                            {/* --- 5. NEW PAGINATION CONTROLS --- */}
                                            {/* Only show controls if there's more than one page */}
                                            {totalPages > 1 && (
                                                <div className="mt-12 flex justify-center items-center gap-4">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                                        aria-label="Previous page"
                                                    >
                                                        <ChevronLeft size={16} /> Previous
                                                    </button>
                                                    <span className="text-stone-600 font-medium text-sm">
                                                        Page {currentPage} of {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                                        aria-label="Next page"
                                                    >
                                                        Next <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
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
            
            <footer className="bg-stone-900 text-stone-300">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                    
                    <Link href="/" className="text-2xl font-bold text-white">
                    Echo
                    </Link>
                    
                    <p className="mt-4 text-stone-400 max-w-md mx-auto">
                    Hold onto the stories that hold us together.
                    </p>

                    <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 text-sm font-medium">
                    
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-stone-300">
                        {footerLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                            {link.label}
                        </Link>
                        ))}
                    </div>
                        
                    <div className="h-4 w-px bg-stone-700 hidden md:block"></div>

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
    );
}