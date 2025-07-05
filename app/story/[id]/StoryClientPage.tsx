"use client";

// This component is responsible for DISPLAYING the story
import type { Story } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag, UserCircle } from 'lucide-react';

export default function StoryClientPage({ story }: { story: Story }) {
    if (!story) {
        return <div className="text-center py-48">Story not found.</div>;
    }
    
    return (
        <div className="bg-white min-h-screen text-stone-800 font-sans">
          <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="text-2xl font-bold text-stone-900 tracking-tighter">Echo</Link>
                    <Link href="/explore" className="text-stone-600 hover:text-stone-900 transition-colors text-base font-semibold">← Back to Explore</Link>
                </div>
            </div>
          </nav>

          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <article>
              <header className="mb-12">
                <h1 className="text-4xl md:text-6xl font-serif text-stone-900 tracking-tight">{story.title}</h1>
                <div className="mt-6 flex items-center gap-6 text-stone-500 text-sm">
                    <div className="flex items-center gap-2">
                        <UserCircle size={16} />
                        <span>{story.speaker}{story.age && `, ${story.age}`} {story.pronouns && `(${story.pronouns})`}</span>
                    </div>
                    {story.location?.name && (
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{story.location.name}</span>
                        </div>
                    )}
                </div>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-2">
                  {story.imageUrl && (
                    <Image src={story.imageUrl} alt={story.title} width={400} height={500} className="rounded-lg object-cover w-full shadow-md" />
                  )}
                </div>
                <div className="md:col-span-3">
                  <div className="bg-stone-50 rounded-lg p-6 border border-stone-200">
                     <h3 className="font-semibold text-stone-800 mb-3">Listen to the Story</h3>
                     <audio controls src={story.audioUrl} className="w-full">
                        Your browser does not support the audio element.
                     </audio>
                     <p className="text-xs text-stone-500 mt-3">Can't listen right now? Read the summary below.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 prose prose-lg max-w-none prose-stone">
                 <p>{story.excerpt}</p>
              </div>

              <div className="mt-12 border-t border-stone-200 pt-8">
                <div className="flex flex-wrap gap-2 items-center">
                  <Tag size={16} className="text-stone-500"/>
                  {story.tags?.map(tag => (
                    <span key={tag} className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          </main>
        </div>
    );
}