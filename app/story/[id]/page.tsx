import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import StoryClientPage from './StoryClientPage';
import type { Story } from '@/lib/types';
import Link from 'next/link';

// This helper function now correctly fetches ALL story data, including the new date fields
async function getStory(id: string): Promise<Story | null> {
    try {
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const storyData: Story = {
              id: docSnap.id,
              title: data.title,
              speaker: data.speaker, // Make sure this matches your DB field name
              age: data.age,
              pronouns: data.pronouns,
              excerpt: data.summary,
              photoUrl: data.photoUrl,
              audioUrl: data.audioUrl,
              tags: data.tags,
              location: data.location,
              // ✨ FIX: Adding the new date fields to the object
              dateType: data.dateType,
              startYear: data.startYear,
              endYear: data.endYear,
              specificYear: data.specificYear,
              createdAt: data.createdAt?.toDate().toISOString(),
            };
            return storyData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching story:", error);
        return null;
    }
}


export default async function StoryPage({ params }: { params: { id: string } }) {
    const story = await getStory(params.id);
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

    return <StoryClientPage story={story} />;
}