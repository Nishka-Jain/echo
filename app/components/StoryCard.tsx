"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

const StoryCard = ({ id, imageUrl, title, speaker, tags, excerpt, location, era }: Story) => (
  <a href={`/story/${id}`} className="block bg-white rounded-xl border border-stone-200 overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="relative w-full h-48">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-6 flex flex-col h-full">
      <div>
        <p className="text-sm font-semibold text-amber-700">{speaker}</p>
        <h3 className="text-2xl font-serif text-stone-900 mt-1">{title}</h3>
        <p className="text-stone-600 mt-3 h-20 line-clamp-3 leading-relaxed">{excerpt}</p>
      </div>
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-sm text-stone-500">
             <div className="flex items-center">
                {/* We now safely render location.name, which is a string */}
                {location && <MapPin size={16} className="mr-2"/>}
                <span>{location?.name}{era ? `, ${era}` : ''}</span>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">{tag}</span>
            ))}
        </div>
      </div>
    </div>
  </a>
);

export default StoryCard;