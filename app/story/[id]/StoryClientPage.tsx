"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/types';
import { MapPin, Tag, UserCircle, Calendar } from 'lucide-react';

const formatStoryDate = (story: Story): string | null => {
    if (story.dateType === 'year' && story.specificYear) {
        return story.specificYear.toString();
    }
    if (story.dateType === 'period') {
        if (story.startYear && story.endYear) {
            if (story.startYear === story.endYear) return story.startYear.toString();
            return `${story.startYear} - ${story.endYear}`;
        }
        if (story.startYear) {
            return `From ${story.startYear}`;
        }
    }
    return null;
};

export default function StoryClientPage({ story }: { story: Story | null }) {
    if (!story) {
        return (
            <div className="flex items-center justify-center min-h-screen text-center px-4">
                <div>
                    <h1 className="text-4xl font-serif text-stone-800">Story Not Found</h1>
                    <p className="mt-4 text-lg text-stone-600">Sorry, we couldn't find the story you were looking for.</p>
                    <Link href="/explore" className="mt-6 inline-block text-lg font-semibold text-amber-700 hover:text-amber-800">
                        ← Back to Explore
                    </Link>
                </div>
            </div>
        );
    }

    const storyOccurrenceDate = formatStoryDate(story);
    const submissionDate = story.createdAt 
        ? new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
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
                        
                        <div className="mt-6 text-sm text-stone-600 space-y-1">
                            {storyOccurrenceDate && (
                                <p><span className="font-semibold text-stone-800">Occurred:</span> {storyOccurrenceDate}</p>
                            )}
                            {submissionDate && (
                                <p><span className="font-semibold text-stone-800">Submitted:</span> {submissionDate}</p>
                            )}
                        </div>
                    </header>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        <div className="md:col-span-2">
                            {story.photoUrl && (
                                <Image src={story.photoUrl} alt={story.title} width={400} height={500} className="rounded-lg object-cover w-full shadow-md" />
                            )}
                        </div>
                        <div className="md:col-span-3">
                            <div className="bg-stone-50 rounded-lg p-6 border border-stone-200 h-full flex flex-col justify-center">
                                 <h3 className="font-semibold text-stone-800 mb-3">Listen to the Story</h3>
                                 {story.audioUrl ? (
                                    <audio controls src={story.audioUrl} className="w-full">
                                        Your browser does not support the audio element.
                                    </audio>
                                 ) : (
                                    <p className="text-stone-500">No audio was uploaded for this story.</p>
                                 )}
                                 <p className="text-xs text-stone-500 mt-3">Can't listen right now? Read the story excerpt below.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-12 prose prose-lg max-w-none prose-stone">
                         <p>{story.excerpt}</p>
                    </div>

                    {story.tags && story.tags.length > 0 && (
                        <div className="mt-12 border-t border-stone-200 pt-8">
                            <div className="flex flex-wrap gap-2 items-center">
                            <Tag size={16} className="text-stone-500"/>
                            {story.tags.map(tag => (
                                <span key={tag} className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">{tag}</span>
                            ))}
                            </div>
                        </div>
                    )}
                </article>
            </main>
        </div>
    );
}