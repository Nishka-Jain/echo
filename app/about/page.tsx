"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookHeart, Globe, Leaf, Users } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';

export default function AboutPage() {
  return (
    <div className="bg-white text-stone-800 font-sans">
      
      {/* --- NAVBAR (This is your existing navbar) --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-stone-900 tracking-tighter">Echo</span>
            </Link>
            <div className="hidden md:flex items-center space-x-10">
              <Link href="/about" className="text-stone-800 font-bold transition-colors text-base">About</Link>
              <Link href="/submit" className="text-stone-600 hover:text-stone-900 transition-colors text-base">Record a Memory</Link>
              <Link href="/explore" className="text-stone-600 hover:text-stone-900 transition-colors text-base">Explore</Link>
            </div>
            <div className="flex items-center">
               <Link href="/login" className="text-stone-600 hover:text-stone-900 border border-stone-300 hover:border-stone-500 px-4 py-2 rounded-lg transition-colors shadow-sm">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="overflow-hidden">
        <AnimatedSection>
            <header className="bg-white pt-20 pb-12 sm:pt-22 sm:pb-10">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif tracking-tight text-stone-900">
                      A Bridge Between Generations.
                    </h1>
                    <p className="mt-8 max-w-3xl mx-auto text-lg lg:text-xl text-stone-600 leading-relaxed">
                      Echo empowers students and families alike to preserve the irreplaceable wisdom of human experience, ensuring that every voice can be heard for generations to come.
                    </p>
              </div>
            </header>
        </AnimatedSection>
        
        {/* === NEW: "The Problem" section with creative image collage === */}
        <AnimatedSection>
            <section className="pt-12 pb-24 sm:pt-20 sm:pb-28">
              <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
                <div className="grid md:grid-cols-2 gap-16 md:gap-24">

                  <div className="flex items-center">
                    <div className="grid grid-cols-3 grid-rows-3 gap-4 h-[500px] w-full">
                      <div className="col-span-2 row-span-1 relative rounded-lg overflow-hidden">
                        <Image src="/bwfishing.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                    {/* Image 2: Spans 2 rows */}
                      <div className="col-span-1 row-span-2 relative rounded-lg overflow-hidden">
                        <Image src="/bwtunnel.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                    {/* Image 3: Standard 1x1 */}
                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                        <Image src="/bwkid.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                        <Image src="/drag.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>
                    
                    {/* Image 4: Spans 2 columns, 2 rows */}
                      <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
                        <Image src="/bwboat.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                      <div className="col-span-1 row-span-2 relative rounded-lg overflow-hidden">
                        <Image src="/bwwoman.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="font-serif text-3xl lg:text-4xl text-stone-900 mb-6">
                      The Disappearing Voice
                    </h2>
                    <div className="prose prose-lg max-w-none text-stone-600 leading-relaxed space-y-6"
                     style={{ fontSize: 'clamp(1rem, 4cqi, 1.125rem)' }}>
                      <p>
                        In a world of fleeting digital text, the most personal and profound method of storytelling,<span className="font-semibold text-stone-800"> the human voice</span>, is often lost. Priceless family memories, cultural traditions, and the histories of entire communities disappear when the last person who remembers them is gone. 
                      </p>

                      <p>
                        It's the unwritten histories of our own families and the quiet wisdom of our local communities that are most at risk. The detailed craft of an artisan, the firsthand account of a pivotal event, the secret to a perfect dish: these fragments of our heritage are often not considered 'important' enough for formal archives, yet they are the very threads that weave the fabric of our lives.
                      </p>
                      <p>
                        <span className="font-semibold text-stone-800">Echo is the answer.</span> Together, we are building a living archive where the wisdom of the past is always present to inform the future.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </AnimatedSection>
        
        <section className="bg-stone-900 text-white py-22 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-10">
            <AnimatedSection>
              <div className="text-center">
                <h2 className="font-serif text-3xl lg:text-5xl">Our Guiding Principles</h2>
                <p className="mt-4 text-lg text-stone-300 max-w-2xl mx-auto">These ideas are the foundation of everything we build.</p>
              </div>
              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                <div className="flex gap-6">
                  <div className="flex-shrink-0"><BookHeart className="h-8 w-8 text-white"/></div>
                  <div>
                    <h3 className="text-2xl font-semibold">Preserve with Purpose</h3>
                    <p className="mt-2 text-stone-300 leading-relaxed">We conserve not just voices but the identities, traditions, and irreplaceable wisdom they carry.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0"><Users className="h-8 w-8 text-white"/></div>
                  <div>
                    <h3 className="text-2xl font-semibold">Connect Generations</h3>
                    <p className="mt-2 text-stone-300 leading-relaxed">We empower young people to become historians, forging powerful connections with their elders.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0"><Globe className="h-8 w-8 text-white"/></div>
                  <div>
                    <h3 className="text-2xl font-semibold">Democratize Archives</h3>
                    <p className="mt-2 text-stone-300 leading-relaxed">We believe personal histories and cultural narratives should be accessible to all, not locked away.</p>

                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0"><Leaf className="h-8 w-8 text-white"/></div>
                  <div>
                    <h3 className="text-2xl font-semibold">Sustain Wisdom</h3>
                    <p className="mt-2 text-stone-300 leading-relaxed">True sustainability isn't just about the planet; it's about ensuring human wisdom endures.</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* === NEW: "Founder's Story" section for a personal touch === */}
        <AnimatedSection>
          <section className="bg-white py-22 sm:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-12 items-center">
                <div className="md:col-span-1">
                  {/* Remember to replace this with a real photo in your /public folder */}
                  <Image 
                    src="/founder-photo.jpg" 
                    alt="Portrait of the founder of Echo."
                    width={500}
                    height={500}
                    className="object-cover rounded-full aspect-square shadow-lg mx-auto"
                  />
                </div>
                <div className="md:col-span-2">
                  <blockquote className="text-xl lg:text-2xl font-serif text-stone-800 leading-relaxed">
                    "I created Echo after realizing my grandfather's incredible stories of immigrating to America existed only in my memory. I wanted to build something that would let anyone capture that magic—that voice—before it's gone forever. Echo is a promise to him, and to everyone with a story to tell."
                  </blockquote>
                  <cite className="mt-6 block font-semibold text-stone-900 not-italic">
                    Nishka Jain
                    <span className="ml-2 font-normal text-stone-600">Co-Founder of Echo</span>
                  </cite>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>
      </main>

      {/* --- FOOTER (Your original footer) --- */}
      <footer className="bg-stone-900 text-stone-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="text-xl font-bold text-white">Echo</Link>
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