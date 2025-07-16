import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import StoryClientPage from './StoryClientPage';
import type { Story } from '@/lib/types';
import Link from 'next/link';

async function getStory(id: string): Promise<Story | null> {
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
            return storyData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching story:", error);
        return null;
    }
}

// FIX: The type for props is now defined directly in the function signature
// and the 'id' is destructured immediately.
type tParams = Promise<{ id: string }>;
export default async function StoryPage(props: { params: tParams}) {
    const { id } = await props.params;
    const story = await getStory(id);

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