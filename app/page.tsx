"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Heart, ArrowRight, MapIcon } from 'lucide-react';
import AnimatedSection from '@/app/components/AnimatedSection';
import dynamic from 'next/dynamic';

// Import the component and the UNIFIED `Story` type.
import StoryCard from './components/StoryCard'; 
const HomepageMap = dynamic(() => import('./components/HomepageMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-stone-200 animate-pulse"></div>,
});

const featuredStories: Story[] = [
  {
    id: 'story-1',
    title: 'Growing up on the Farm',
    speaker: 'John M.',
    excerpt: "I remember the smell of hay in the summer and the sound of the rooster at dawn. We didn't have much, but we had each other, and that was everything...",
    imageUrl: 'https://images.unsplash.com/photo-1422493757035-1e5e03968f95?q=80&w=2070&auto=format&fit=crop',
    location: { name: 'Rural Iowa', lat: 41.8781, lng: -93.0977 },
    era: '1952',
    tags: ['Childhood', 'Farm Life', 'Family']
  },
  {
    id: 'story-2',
    title: 'A New Beginning',
    speaker: 'Maria G.',
    excerpt: "Leaving everything behind was the hardest thing I've ever done. But when I saw the skyline of the city, I knew I had made the right choice for my children.",
    imageUrl: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?q=80&w=1965&auto=format&fit=crop',
    location: { name: 'New York City', lat: 40.7128, lng: -74.0060 },
    era: '1985',
    tags: ['Migration', 'Hope']
  },
  {
    id: 'story-3',
    title: "My Grandmother's Recipes",
    speaker: 'Sofia R.',
    excerpt: "Every Sunday, the whole family would gather. The secret to her cooking, she'd say, wasn't an ingredient. It was love. Just pure, simple love.",
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1974&auto=format&fit=crop',
    location: { name: 'Naples, Italy', lat: 40.8518, lng: 14.2681 },
    era: 'Family',
    tags: ['Tradition', 'Food', 'Family']
  }
];

const missionImages = [
    { src: "/vendorcolor.jpg" , alt: 'A group of friends laughing and talking together at a table.' },
    { src: "/dragcolor.jpg", alt: 'A diverse group of people collaborating in a workshop.' },
    { src: "/womanvendor.jpg", alt: 'The hands of an older person and a younger person touching.' },
    { src: "/womenoutside.jpg", alt: 'The hands of an older person and a younger person touching.' },
    { src: "/food.jpg", alt: 'The hands of an older person and a younger person touching.' },
];

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentImageIndex(prevIndex => (prevIndex + 1) % missionImages.length);
      }, 7000); // Rotate image every 7 seconds

      return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);

return (
  <div className="bg-white text-stone-800 font-sans">
    
    {/* Hero Section Container */}
    <div className="relative h-[85vh] text-white overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0">
          <Image
              src="/market.jpg" // Assumes 'market.jpg' is in your /public folder
              alt="A bustling market scene, representing the diversity of human stories."
              fill
              style={{ objectFit: 'cover' }}
              priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col">
        <nav className="bg-transparent">
          <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 border-b border-white/20">
              <Link href="/" className="text-2xl font-bold tracking-tighter">
                  Echo
              </Link>
              <div className="hidden md:flex items-center space-x-10">
                <Link href="/about" className="text-stone-300 hover:text-white transition-colors text-base">About</Link>
                <Link href="/submit" className="text-stone-300 hover:text-white transition-colors text-base">Record a Memory</Link>
                <Link href="/explore" className="text-stone-300 hover:text-white transition-colors text-base">Explore</Link>
              </div>
              <div className="flex items-center">
                 <Link href="/login" className="text-white hover:bg-white/20 border border-white/50 px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <header className="flex flex-grow items-center justify-center text-center">
          <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif tracking-tight">
              Hold onto the stories that hold us together.
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-lg text-stone-200">
              A platform to record, preserve, and explore real stories, memories, and life wisdom — before they’re lost.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/submit" className="w-full sm:w-auto bg-transparent border border-white/50 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <Mic size={20} /> Record a Memory
              </Link>
              <Link href="/explore" className="w-full sm:w-auto bg-white text-stone-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-stone-200 transition-all shadow-md transform hover:-translate-y-0.5">
                Explore Stories
              </Link>
            </div>
          </div>
        </header>
      </div>
    </div>
    
    <AnimatedSection>
      <section id="about" className="py-22 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-10 sm:px-10 lg:px-15">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 items-center">
                <div className="md:col-span-2 flex flex-col justify-center h-full">
                     <h2 className="font-serif text-4xl lg:text-5xl text-stone-900 mb-8">Our Mission</h2>
                    <p className="text-xl lg:text-2xl text-stone-600 leading-relaxed">
                        Echo is a living archive of human experience, told in the original voices of those who lived it. We believe preserving these memories creates a powerful bridge between generations.
                    </p>
                     <Link href="/about" className="inline-flex items-center font-semibold text-stone-800 hover:text-amber-700 group no-underline mt-8 text-lg">
                        Learn more about our values <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                     </Link>
                </div>
                 <div className="md:col-span-3 relative aspect-[4/3] md:aspect-video shadow-lg border border-stone-200 overflow-hidden">
                    {missionImages.map((image, index) => (
                        <Image
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            fill
                            style={{ objectFit: 'cover' }}
                            className={`transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            priority={index === 0}
                        />
                    ))}
                 </div>
            </div>
        </div>
      </section>
    </AnimatedSection>
    
    <AnimatedSection>
      <section id="explore" className="py-24 sm:py-28 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-15 sm:px-15 lg:px-20">
            <div className="text-center">
                <h2 className="text-4xl font-serif tracking-tight text-stone-900 sm:text-5xl">Explore the Web of Voices</h2>
                <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">An ever-growing collection of authentic first-person narratives.</p>
            </div>
            <div className="mt-20 grid gap-9 md:grid-cols-2 lg:grid-cols-3">
              {featuredStories.map((story) => (
                <StoryCard key={story.id} {...story} />
              ))}
            </div>
             <div className="text-center mt-20">
                 <Link href="/explore" className="text-lg font-semibold text-stone-800 hover:text-amber-700 transition-colors group inline-flex items-center">
                    See All Stories <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                 </Link>
             </div>
        </div>
      </section>
    </AnimatedSection>

    <AnimatedSection>
        <section className="py-22 sm:py-28 bg-white border-t border-stone-200" >
          <div className="max-w-7xl mx-auto px-10 sm:px-10 lg:px-15">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-video rounded-xl shadow-lg border border-stone-200 overflow-hidden">
                <HomepageMap stories={featuredStories} />
              </div>
              <div className="text-left">
                <h2 className="font-serif text-4xl lg:text-5xl text-stone-900 mb-6">
                  The World is Full of Stories.
                </h2>
                <p className="text-xl text-stone-600 leading-relaxed mb-8">
                  Our interactive map allows you to discover oral histories by the places they come from. Journey from bustling city streets to quiet countrysides, and listen to the voices that shape our world.
                </p>
                <Link href="/explore" className="inline-flex items-center font-semibold text-amber-700 hover:text-amber-800 group text-lg">
                  Browse the Map <MapIcon className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
      
    <AnimatedSection>
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-10 sm:px-10 lg:px-15 py-24 text-center">
            <Heart className="mx-auto h-12 w-12 text-amber-500/80 mb-4" />
            <blockquote className="text-2xl sm:text-3xl font-serif text-stone-900">
              <p>"Hearing my grandfather's voice again, telling his stories... it's a gift I can't put a price on. Echo brought a piece of him back to us."</p>
            </blockquote>
            <cite className="mt-6 block font-medium text-stone-600 not-italic">- Sarah L., Community Historian</cite>
        </div>
      </section>
    </AnimatedSection>

    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                  <Link href="/" className="text-xl font-bold text-white">🎤 Echo</Link>
                  <p className="mt-2 text-stone-400 text-sm">Hold onto the stories that hold us together.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-white tracking-wider uppercase">Navigate</h4>
                  <ul className="mt-4 space-y-2">
                      <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
                      <li><Link href="/submit" className="hover:text-amber-400 transition-colors">Record a Memory</Link></li>
                      <li><Link href="/explore" className="hover:text-amber-400 transition-colors">Explore</Link></li>
                  </ul>
              </div>
              <div>
                   <h4 className="font-semibold text-white tracking-wider uppercase">Resources</h4>
                  <ul className="mt-4 space-y-2">
                      <li><Link href="/families" className="hover:text-amber-400 transition-colors">For Families</Link></li>
                      <li><Link href="/educators" className="hover:text-amber-400 transition-colors">For Educators</Link></li>
                      <li><Link href="/communities" className="hover:text-amber-400 transition-colors">For Communities</Link></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-semibold text-white tracking-wider uppercase">Contact</h4>
                  <ul className="mt-4 space-y-2">
                      <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link></li>
                      <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Twitter</a></li>
                  </ul>
              </div>
          </div>
          <div className="mt-8 border-t border-stone-800 pt-8 text-center text-sm text-stone-500">
              <p>&copy; {new Date().getFullYear()} Echo. All rights reserved.</p>
          </div>
      </div>
    </footer>
  </div>
);
}
