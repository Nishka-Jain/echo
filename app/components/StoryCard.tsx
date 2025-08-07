"use client";

import React from 'react';
import Link from 'next/link';
import type { Story } from '@/lib/types';
import Voiceprint from './Voiceprint'; 

const StoryCard = ({ id, title, speaker, tags, excerpt, ...story }: Story) => {
    const storyYear = story.specificYear || story.startYear;

    return (
        <Link 
          href={`/story/${id}`} 
          className="flex flex-col bg-white rounded-xl border border-stone-200 p-6 text-center group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            {/* --- 1. Main Content - Typography Focused --- */}
            <div className="flex flex-col flex-grow items-center">
                <p className="text-sm font-semibold text-amber-700">{speaker}</p>
                <h3 className="text-3xl font-serif text-stone-900 mt-2 transition-colors duration-300 group-hover:text-amber-800">{title}</h3>
                {storyYear && (
                    <p className="text-xs text-stone-500 font-mono mt-2">EST. {storyYear}</p>
                )}
                <p className="text-stone-600 mt-4 max-w-prose flex-grow">{excerpt}</p>
                
                {/* --- Tags Section (Newly Added) --- */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>

            {/* --- 2. Graphic as a "Signature" --- */}
            <div className="mt-6 pt-6 border-t border-stone-100 flex-shrink-0">
                <div className="w-48 h-10 mx-auto">
                    <Voiceprint text={id} />
                </div>
            </div>
        </Link>
    );
};

export default StoryCard;