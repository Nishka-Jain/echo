"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Search, ChevronDown, Map, List, Mic } from 'lucide-react';

// --- Type Definition ---
// Added for type safety
type Story = {
  id: string;
  imageUrl: string;
  title: string;
  speaker: string;
  excerpt: string;
  tags: string[];
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
};


// --- MOCK DATABASE ---
const allStories: Story[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1542103749-8ef59b94f475?q=80&w=2070&auto=format&fit=crop', title: 'The Corner Bodega', speaker: 'Maria Rodriguez', excerpt: 'It was more than a store; it was the heart of our neighborhood. Everyone knew everyone...', tags: ['Community', 'New York', 'Family'], location: { name: 'Brooklyn, NY', lat: 40.6782, lng: -73.9442 } },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1519995168-94754a654634?q=80&w=1887&auto=format&fit=crop', title: 'Midwestern Harvests', speaker: 'John Miller', excerpt: 'Waking up before the sun, the smell of dew on the cornfields... that’s a memory that never leaves you.', tags: ['Tradition', 'Work', 'Childhood'], location: { name: 'Rural Iowa', lat: 41.8781, lng: -93.0977 } },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop', title: 'Crossing the Bridge', speaker: 'Kenji Tanaka', excerpt: 'Seeing the Golden Gate for the first time, I knew I had arrived somewhere special. It was a new start.', tags: ['Migration', 'Hope', 'San Francisco'], location: { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 } },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872d24?q=80&w=2070&auto=format&fit=crop', title: 'Songs of the Andes', speaker: 'Elena Quispe', excerpt: 'My grandmother taught me the songs of our people, melodies that have echoed through the mountains for centuries.', tags: ['Tradition', 'Music', 'Peru'], location: { name: 'Cusco, Peru', lat: -13.5320, lng: -71.9675 } },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1886&auto=format&fit=crop', title: 'Summer on the Coast', speaker: 'Chloe O’Connell', excerpt: 'The salt in the air, the sound of the waves... every summer was a lifetime of its own.', tags: ['Childhood', 'Ireland', 'Family'], location: { name: 'Galway, Ireland', lat: 53.2707, lng: -9.0568 } },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop', title: 'Streetlight Symphonies', speaker: 'David Chen', excerpt: 'In the neon glow of Hong Kong, I found my rhythm. The city has its own music if you just listen.', tags: ['City Life', 'Art', 'Hong Kong'], location: { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 } },
];

const StoryMap = dynamic(() => import('../components/StoryMap'), {
    ssr: false,
    loading: () => <div className="w-full h-[600px] bg-stone-200 rounded-xl flex items-center justify-center"><p>Loading map...</p></div>
});

const popularTags = ['Family', 'Tradition', 'Migration', 'Childhood', 'Community', 'Work', 'Hope', 'New York'];

// --- Reusable Components ---
const StoryCard = ({ imageUrl, title, speaker, tags, excerpt }: Story) => (
  <Link href={`/story/${title.toLowerCase().replace(/\s+/g, '-')}`} className="block bg-white rounded-xl border border-stone-200 overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="relative w-full h-48">
      <Image src={imageUrl} alt={`An evocative image for the story titled ${title}`} fill className="object-cover" />
    </div>
    <div className="p-6">
      <p className="text-sm font-semibold text-amber-700">{speaker}</p>
      <h3 className="text-2xl font-serif text-stone-900 mt-1">{title}</h3>
      <p className="text-stone-600 mt-3 h-20 line-clamp-3 leading-relaxed">{excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">{tag}</span>
        ))}
      </div>
    </div>
  </Link>
);

export default function ExplorePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState('grid');

    const filteredStories = useMemo(() => {
        return allStories.filter(story => {
            const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.speaker.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = activeTag ? story.tags.includes(activeTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [searchTerm, activeTag]);

    return (
        <div className="bg-white min-h-screen text-stone-800 font-sans">
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-stone-900 tracking-tighter">Echo</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-10">
                            <Link href="/about" className="text-stone-600 hover:text-stone-900 transition-colors text-base">About</Link>
                            <Link href="/submit" className="text-stone-600 hover:text-stone-900 transition-colors text-base">Record a Memory</Link>
                            <Link href="/explore" className="text-stone-800 font-bold transition-colors text-base">Explore</Link>
                        </div>
                        <div className="flex items-center">
                           <Link href="/login" className="text-stone-600 hover:text-stone-900 border border-stone-300 hover:border-stone-500 px-4 py-2 rounded-lg transition-colors shadow-sm">Login</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-12 py-15">
                <header className="text-center mt-5 mb-6">
                    <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-stone-900">Explore Stories</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">Discover a living archive of voices, memories, and wisdom from around the world.</p>
                    
                    <div className="flex items-center justify-center bg-stone-200 border border-stone-300 rounded-lg p-1 mt-8 max-w-min mx-auto">
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

                <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md py-4 mb-8 rounded-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Search by title or speaker..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-stone-300 rounded-lg hover:bg-stone-100">
                               <span>Themes</span>
                               <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 pb-2 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTag(null)}
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${!activeTag ? 'bg-stone-800 text-white' : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'}`}
                        >
                            All
                        </button>
                        {popularTags.map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-1.5 text-sm rounded-full transition-colors whitespace-nowrap ${activeTag === tag ? 'bg-stone-800 text-white' : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-300'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {viewMode === 'grid' && (
                    <>
                        {filteredStories.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredStories.map(story => (
                                    <StoryCard key={story.id} {...story} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 border-2 border-dashed border-stone-300 rounded-xl">
                                <h3 className="text-2xl font-serif text-stone-800">No stories match your search.</h3>
                                <p className="mt-4 text-stone-600">Why not be the first to share one?</p>
                                <Link href="/submit" className="mt-6 inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-stone-900 transition-all shadow-md">
                                    <Mic size={20} /> Record a Memory
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {viewMode === 'map' && (
                    <StoryMap stories={filteredStories} />
                )}
            </main>

            <footer className="bg-stone-900 text-stone-300">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">

                    {/* Brand Name */}
                    <Link href="/" className="text-2xl font-bold text-white">
                    Echo
                    </Link>
                    
                    {/* Tagline */}
                    <p className="mt-4 text-stone-400 max-w-md mx-auto">
                    Hold onto the stories that hold us together.
                    </p>

                    {/* All Links & Socials in a single row */}
                    <div className="mt-8 flex justify-center items-center gap-6 text-sm font-medium text-stone-300">
                    <Link href="/about" className="hover:text-white transition-colors">About</Link>
                    <Link href="/submit" className="hover:text-white transition-colors">Submit</Link>
                    <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                    <Link href="/about#contact" className="hover:text-white transition-colors">Contact</Link>
                    
                    {/* A small visual separator */}
                    <div className="h-4 w-px bg-stone-700"></div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-5">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="m9.5 9.5 5 5"/><path d="m14.5 9.5-5 5"/></svg>
                        </a>
                    </div>
                    </div>
                    
                    {/* Copyright */}
                    <p className="mt-10 text-xs text-stone-500">&copy; {new Date().getFullYear()} Echo. All rights reserved.</p>

                </div>
            </footer>
        </div>
    );
}
