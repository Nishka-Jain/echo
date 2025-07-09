"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Story } from '@/lib/types';
import { Calendar } from 'lucide-react';

// A small helper function to format the date display
const formatStoryDate = (story: Story) => {
    if (story.dateType === 'year' && story.specificYear) {
        return story.specificYear.toString();
    }
    if (story.dateType === 'period' && story.startYear && story.endYear) {
        return `${story.startYear} - ${story.endYear}`;
    }
    if (story.dateType === 'period' && story.startYear) {
        return `From ${story.startYear}`;
    }
    return null;
};

const StoryCard = ({ id, photoUrl, title, speaker, tags, excerpt, ...story }: Story) => {
    const displayDate = formatStoryDate(story as Story);

    return (
        <Link href={`/story/${id}`} className="flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative w-full h-48 bg-stone-100">
                {photoUrl && (
                    <Image src={photoUrl} alt={`An evocative image for the story titled ${title}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm font-semibold text-amber-700">{speaker}</p>
                <h3 className="text-2xl font-serif text-stone-900 mt-1">{title}</h3>
                
                {/* ✨ NEW: Display the formatted date if it exists */}
                {displayDate && (
                    <div className="flex items-center gap-2 text-sm text-stone-500 mt-2">
                        <Calendar size={14} />
                        <span>{displayDate}</span>
                    </div>
                )}

                <p className="text-stone-600 mt-3 h-20 line-clamp-3 leading-relaxed flex-grow">{excerpt}</p>
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