"use client"; // This is now a Client Component

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import StoryEditForm from './StoryEditForm'; 
import type { Story } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// The data fetching logic is now inside the client component
export default function StoryEditPage() {
    const [story, setStory] = useState<Story | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pathname = usePathname();
    const id = pathname.split('/').pop();

    useEffect(() => {
        if (!id) {
            setError("Story ID not found.");
            setIsLoading(false);
            return;
        }

        const fetchStory = async () => {
            try {
                const docRef = doc(db, "stories", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const storyData: Story = {
                      id: docSnap.id,
                      title: data.title,
                      speaker: data.speaker,
                      age: data.age,
                      pronouns: data.pronouns,
                      excerpt: data.summary,
                      photoUrl: data.photoUrl,
                      audioUrl: data.audioUrl,
                      tags: data.tags,
                      location: data.location,
                      createdAt: data.createdAt?.toDate().toISOString(),
                      dateType: data.dateType,
                      startYear: data.startYear,
                      endYear: data.endYear,
                      specificYear: data.specificYear,
                      authorId: data.authorId,
                      transcription: data.transcription,
                    };
                    setStory(storyData);
                } else {
                    setError("No such story found.");
                }
            } catch (err) {
                console.error("Error fetching story:", err);
                setError("Failed to fetch story data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStory();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-stone-500" />
            </div>
        );
    }

    if (error || !story) {
        return (
            <div className="text-center py-48">
                <h1 className="text-2xl font-serif">{error || "Story Not Found"}</h1>
                <Link href="/explore" className="text-amber-700 font-semibold mt-6 inline-block">← Back to Explore</Link>
            </div>
        );
    }
    
    return (
        <div className="bg-stone-100 min-h-screen font-sans">
             <main className="py-16 sm:py-24">
                 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <StoryEditForm initialStory={story} />
                 </div>
             </main>
        </div>
    );
}

// import { db } from '@/lib/firebase';
// import { doc, getDoc } from 'firebase/firestore';
// import StoryEditForm from './StoryEditForm'; 
// import type { Story } from '@/lib/types';
// import Link from 'next/link';

// // This helper function fetches the story data from Firestore
// async function getStory(id: string): Promise<Story | null> {
//     try {
//         const docRef = doc(db, "stories", id);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//             const data = docSnap.data();
//             const storyData: Story = {
//               id: docSnap.id,
//               title: data.title,
//               speaker: data.speaker,
//               age: data.age,
//               pronouns: data.pronouns,
//               excerpt: data.summary,
//               photoUrl: data.photoUrl,
//               audioUrl: data.audioUrl,
//               tags: data.tags,
//               location: data.location,
//               createdAt: data.createdAt?.toDate().toISOString(),
//               dateType: data.dateType,
//               startYear: data.startYear,
//               endYear: data.endYear,
//               specificYear: data.specificYear,
//               authorId: data.authorId,
//               transcription: data.transcription,
//             };
//             return storyData;
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Error fetching story:", error);
//         return null;
//     }
// }

// // FIX: The custom 'PageProps' type has been removed. The type for props
// // is now defined directly and explicitly in the function signature.
// export default async function StoryEditPage({ params }: { params: { id: string } }) {
//     const { id } = params; // Destructure id from params
//     const story = await getStory(id);

//     if (!story) {
//         return (
//             <div className="text-center py-48">
//                 <h1 className="text-2xl font-serif">Story Not Found</h1>
//                 <Link href="/explore" className="text-amber-700 font-semibold mt-6 inline-block">← Back to Explore</Link>
//             </div>
//         );
//     }
    
//     return (
//         <div className="bg-stone-100 min-h-screen font-sans">
//              <main className="py-16 sm:py-24">
//                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <StoryEditForm initialStory={story} />
//                  </div>
//              </main>
//         </div>
//     );
// }
