"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { Story } from '@/lib/types';

// The component now receives the story data as a prop
export default function StoryEditForm({ initialStory }: { initialStory: Story }) {
    const router = useRouter();

    // The state is now initialized with the data passed in via props
    const [storyTitle, setStoryTitle] = useState(initialStory.title || '');
    const [speakerName, setSpeakerName] = useState(initialStory.speaker || '');
    const [summary, setSummary] = useState(initialStory.excerpt || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // We no longer need the useEffect to fetch data in this component!

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Use the story's ID from the initial prop data
        const storyRef = doc(db, "stories", initialStory.id);

        try {
            await updateDoc(storyRef, {
                title: storyTitle,
                speaker: speakerName, // Ensure field name matches your database
                summary: summary
            });
            alert("Story updated successfully!");
            router.push(`/story/${initialStory.id}`);
        } catch (error) {
            console.error("Error updating document: ", error);
            alert("Failed to update story.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-serif mb-6 flex items-center gap-3"><Pencil size={30}/> Edit Your Story</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="storyTitle" className="block text-sm font-medium text-stone-700 mb-1">Story Title</label>
                    <input id="storyTitle" type="text" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} className="w-full p-3 border rounded-lg border-stone-300" />
                </div>
                <div>
                    <label htmlFor="speakerName" className="block text-sm font-medium text-stone-700 mb-1">Speaker Name</label>
                    <input id="speakerName" type="text" value={speakerName} onChange={e => setSpeakerName(e.target.value)} className="w-full p-3 border rounded-lg border-stone-300" />
                </div>
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-stone-700 mb-1">Story Summary</label>
                    <textarea id="summary" value={summary} onChange={e => setSummary(e.target.value)} rows={5} className="w-full p-3 border rounded-lg border-stone-300" />
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                    <Link href={`/profile`} className="px-6 py-2 rounded-lg border border-stone-300 font-semibold hover:bg-stone-100">Cancel</Link>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-lg bg-stone-800 text-white font-semibold disabled:bg-stone-300 hover:bg-stone-900">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}