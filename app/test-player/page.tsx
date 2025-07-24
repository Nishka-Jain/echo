"use client";

import dynamic from 'next/dynamic';

const DynamicAudioPlayer = dynamic(
  () => import('@/app/components/CustomAudioPlayer'),
  { 
    ssr: false, // Player will only render on the client
    loading: () => <div className="w-full h-[56px] bg-stone-200 animate-pulse rounded-lg" />
  }
);

export default function TestPlayerPage() {
  // A public domain test audio file
  const testAudioUrl = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg";

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ fontFamily: 'sans-serif', marginBottom: '20px' }}>Audio Player Test Page</h1>
      <DynamicAudioPlayer src={testAudioUrl} />
    </div>
  );
}