import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import StoryEditForm from './StoryEditForm'; 
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
export default async function StoryPage({ params: { id } }: { params: { id: string } }) {
    const story = await getStory(id);

    if (!story) {
        return (
            <div className="text-center py-48">
                <h1 className="text-2xl font-serif">Story Not Found</h1>
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