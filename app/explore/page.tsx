import { Suspense } from 'react';
import ExploreView from './ExploreView';
import Navbar from '@/app/components/Navbar'; // Import Navbar if you want it outside the suspense boundary

// You can create a more sophisticated loading skeleton here if you wish
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-[50vh]">
        <p className="text-lg text-stone-600">Loading stories from the archive...</p>
    </div>
);

export default function ExplorePage() {
  return (
    // The Suspense boundary wraps the component that uses client-side hooks
    <Suspense fallback={<LoadingSpinner />}>
      <ExploreView />
    </Suspense>
  );
}