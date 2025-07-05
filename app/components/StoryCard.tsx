"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

import type { Story } from '@/lib/types';

// The props now correctly use the imported Story type
const StoryCard = ({ id, photoUrl, title, speaker, age, pronouns, tags, excerpt }: Story) => {
    return (
        <Link href={`/story/${id}`} className="block bg-white rounded-xl border border-stone-200 overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative w-full h-48 bg-stone-100">
                {photoUrl && (
                    <Image 
                      src={photoUrl} 
                      alt={`An evocative image for the story titled ${title}`} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
            </div>
            <div className="p-6">
                <div className="text-sm font-semibold text-amber-700">
                    <span>{speaker}</span>
                    {age && <span>, {age}</span>}
                    {pronouns && <span className="text-stone-500 font-medium ml-2">({pronouns})</span>}
                </div>
                <h3 className="text-2xl font-serif text-stone-900 mt-1">{title}</h3>
                <p className="text-stone-600 mt-3 h-20 line-clamp-3 leading-relaxed">{excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
        </Link>
    );
};

export default StoryCard;