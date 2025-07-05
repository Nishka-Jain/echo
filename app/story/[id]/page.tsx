import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import StoryClientPage from './StoryClientPage';
import type { Story } from '@/lib/types';
import Link from 'next/link';

// This is a helper function to fetch a single story
async function getStory(id: string): Promise<Story | null> {
    try {
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // ✨ FIX: We now explicitly build the object and convert the timestamp
            const storyData: Story = {
              id: docSnap.id,
              title: data.title || 'Untitled Story',
              speaker: data.speaker || 'Unknown Speaker',
              age: data.age,
              pronouns: data.pronouns,
              excerpt: data.summary || 'No summary available.',
              imageUrl: data.photoUrl || '/default-image.png',
              audioUrl: data.audioUrl,
              tags: data.tags || [],
              location: data.location,
              // Convert the Firestore Timestamp to a simple, serializable ISO string
              createdAt: data.createdAt?.toDate().toISOString(),
            };
            return storyData;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching story:", error);
        return null;
    }
}


export default async function StoryPage({ params }: { params: { id: string } }) {
    // We fetch the data here, on the server.
    const story = await getStory(params.id);

    // ✨ FIX: Check for the 'null' case before rendering the client page.
    if (!story) {
        // You can style this page however you like.
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

    // If we get past the check above, TypeScript knows 'story' cannot be null.
    // We can now safely pass it to our client component.
    return <StoryClientPage story={story} />;
}