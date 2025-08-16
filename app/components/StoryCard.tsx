"use client";

import React from 'react';
import Link from 'next/link';
import type { Story } from '@/lib/types'; // Assumes your Story type is in this path
import Voiceprint from './Voiceprint'; 

// A simple, custom SVG component for the "Cupertino" icon
const CupertinoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <text
      x="50%"
      y="52%" // Nudged slightly for better vertical centering
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="12"
      fontWeight="600"
      fill="currentColor"
      stroke="none"
    >
      C
    </text>
  </svg>
);

const StoryCard = ({ id, title, speaker, tags, summary, promptCategoryLabel, ...story }: Story) => {
    const storyYear = story.specificYear || story.startYear;

    return (
        <Link 
          href={`/story/${id}`} 
          className="group/card relative flex flex-col bg-white rounded-xl border border-stone-200 p-6 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:z-20 hover:scale-[1.02]"
        >
            {promptCategoryLabel && (
                <div 
                  className="group absolute top-2 right-2 p-1 z-10" 
                >
                    <CupertinoIcon className="w-6 h-6 text-stone-300 group-hover/card:text-stone-500 transition-colors" />

                    {/* ✨ THIS IS THE LINE WE CHANGED ✨ */}
                    <span className="
                      absolute top-full left-0 mt-2
                      w-max max-w-md 
                      bg-stone-800 text-white text-[14px] font-semibold 
                      px-3 py-1.5 rounded-md 
                      opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none
                      shadow-lg">
                        {`Cupertino Stories: ${promptCategoryLabel}`}
                    </span>
                </div>
            )}

            {/* --- Main Content --- */}
            <div className="flex flex-col flex-grow items-center">
                <p className="text-sm font-semibold text-amber-700">{speaker}</p>
                <h3 className="text-3xl font-serif text-stone-900 mt-2 transition-colors duration-300 group-hover/card:text-amber-800">{title}</h3>
                {storyYear && (
                    <p className="text-xs text-stone-500 font-mono mt-2">EST. {storyYear}</p>
                )}
                <p className="text-stone-600 mt-4 max-w-prose flex-grow">{summary}</p>
                
                {tags && tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* --- Voiceprint Graphic --- */}
            <div className="mt-6 pt-6 border-t border-stone-100 flex-shrink-0">
                <div className="w-48 h-10 mx-auto">
                    <Voiceprint text={id} />
                </div>
            </div>
        </Link>
    );
};

export default StoryCard;