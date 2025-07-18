"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Heart, ArrowRight, MapIcon, Menu, X } from 'lucide-react'; 
import AnimatedSection from '@/app/components/AnimatedSection';
import dynamic from 'next/dynamic';
import { useAuth } from '@/app/context/AuthContext'; 
import Navbar from '@/app/components/Navbar';

import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Story } from '@/lib/types';

import StoryCard from './components/StoryCard'; 

const InstagramIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const FacebookIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const XIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="m9.5 9.5 5 5"/><path d="m14.5 9.5-5 5"/></svg>;

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/submit', label: 'Submit' },
  { href: '/explore', label: 'Explore' },
  { href: '/about#contact', label: 'Contact' },
];

const socialLinks = [
  { href: 'https://instagram.com', label: 'Instagram', icon: <InstagramIcon /> },
  { href: 'https://facebook.com', label: 'Facebook', icon: <FacebookIcon /> },
  { href: 'https://x.com', label: 'X', icon: <XIcon /> },
];

const missionImages = [
    { src: "/vendorcolor.jpg" , alt: 'A diverse group of friends sharing a meal and conversation around a wooden table.' },
    { src: "/dragcolor.jpg", alt: 'A vibrant workshop scene with a diverse group of people collaborating and engaging.' },
    { src: "/womanvendor.jpg", alt: 'An older woman smiling warmly from behind her stall at a local market.' },
    { src: "/womenoutside.jpg", alt: 'Two women, one younger and one older, sitting on a bench outside, sharing a moment.' },
    { src: "/food.jpg", alt: 'Close-up on hands preparing food, symbolizing tradition and family recipes.' },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-stone-200 p-6 animate-pulse">
    <div className="h-48 bg-stone-200 rounded-md"></div>
    <div className="mt-6 space-y-3">
      <div className="h-4 bg-stone-200 rounded w-3/4"></div>
      <div className="h-8 bg-stone-200 rounded w-1/2"></div>
      <div className="h-4 bg-stone-200 rounded"></div>
      <div className="h-4 bg-stone-200 rounded w-5/6"></div>
    </div>
  </div>
);

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signInWithGoogle, logout } = useAuth();

  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for image carousel
  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentImageIndex(prevIndex => (prevIndex + 1) % missionImages.length);
      }, 7000); 
      return () => clearInterval(timer);
  }, []);

  // Effect to prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const getFeaturedStories = async () => {
      try {
        const storiesCollection = collection(db, "stories");
        // Create a query for the 3 most recent stories
        const q = query(
            storiesCollection, 
            orderBy("createdAt", "desc"),
            limit(3) 
        );
        const querySnapshot = await getDocs(q);
        
        const stories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Story[];
        
        setFeaturedStories(stories);
      } catch (error) {
        console.error("Error fetching featured stories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getFeaturedStories();
  }, []); // Empty array ensures this runs only once

return (
  <div className="bg-white text-stone-800 font-sans">
    
    {/* Hero Section Container */}
    <div className="relative h-[85vh] text-white overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0">
          <Image
              src="/market.jpg"
              alt="A bustling market scene, representing the diversity of human stories."
              fill
              style={{ objectFit: 'cover' }}
              priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col">
        
        <Navbar variant="transparent" />

        <header className="flex flex-grow items-center justify-center text-center">
          <div className="max-w-5xl mx-auto px-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif tracking-tight">
              Hold onto the stories that hold us together.
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-lg text-stone-200">
              A platform to record, preserve, and explore real stories, memories, and life wisdom — before they’re lost.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 mx-6 sm:mx-0">
              <Link href="/submit" className="w-full sm:w-auto bg-transparent border border-white/50 px-12 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
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
                 {/* --- IMAGE CAROUSEL START --- */}
                 <div className="md:col-span-3 relative aspect-[4/3] md:aspect-video shadow-lg border border-stone-200 overflow-hidden rounded-xl">
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
                    {/* Carousel Indicators */}
                    <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-3">
                      {missionImages.map((_, index) => (
                        <button
                          key={`dot-${index}`}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentImageIndex === index ? 'w-5 bg-white shadow-md' : 'w-2 bg-white/50 hover:bg-white'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                          aria-current={currentImageIndex === index}
                        />
                      ))}
                    </div>
                 </div>
                 {/* --- IMAGE CAROUSEL END --- */}
            </div>
        </div>
      </section>
    
    <AnimatedSection>
      <section id="explore" className="py-24 sm:py-28 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-10 sm:px-15 lg:px-20">
            <div className="text-center">
                <h2 className="text-4xl font-serif tracking-tight text-stone-900 sm:text-5xl">Explore the Web of Voices</h2>
                <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">An ever-growing collection of authentic first-person narratives.</p>
            </div>
            <div className="mt-20 grid gap-9 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                featuredStories.map((story) => (
                  <StoryCard key={story.id} {...story} />
                ))
              )}
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
              <Link href="/explore" className="group">
                <div className="relative aspect-video rounded-xl shadow-lg border border-stone-200 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/map.png" // Replace with the path to your screenshot
                    alt="A map showing the locations of stories from around the world."
                    fill
                    style={{ objectFit: 'cover' }}
                  />

                </div>
              </Link>
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
          <section className="bg-white border-y border-stone-200 py-22 sm:py-28">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
                <h2 className="font-serif text-4xl lg:text-5xl text-stone-900">Become a Part of the Archive Today</h2>
                <div className="prose prose-xl max-w-none text-stone-600 leading-relaxed mt-8">               
                  <p>
                    Whether you're a student, a teacher, a family historian, or simply someone with a story to share, Echo is for you. Join us in building a lasting resource for generations to come.
                  </p>
                </div>
                <div className="mt-13">
                  <Link href="/submit" className="px-8 py-4 bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-900 transition-all shadow-md transform hover:-translate-y-1">
                      Record a Memory
                  </Link>
                </div>
            </div>
          </section>
        </AnimatedSection>

        <footer className="bg-stone-900 text-stone-300">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
            
            <Link href="/" className="text-2xl font-bold text-white">
              Echo
            </Link>
            
            <p className="mt-4 text-stone-400 max-w-md mx-auto">
              Hold onto the stories that hold us together.
            </p>

            {/* All Links & Socials Container */}
            <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 text-sm font-medium">
              
              {/* Navigation Links Group */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-stone-300">
                {footerLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
                
              {/* Visual Separator for Desktop Only */}
              <div className="h-4 w-px bg-stone-700 hidden md:block"></div>

              {/* Social Icons */}
              <div className="flex items-center gap-5">
                {socialLinks.map((social) => (
                  <a 
                    key={social.href}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={social.label}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <p className="mt-10 text-xs text-stone-500">
              &copy; {new Date().getFullYear()} Echo. All rights reserved.
            </p>

          </div>
        </footer>
  </div>
);
}