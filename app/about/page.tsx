"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Globe, BookHeart, Wind, Users } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';

// StatCard component for displaying key numbers
interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
  }

const StatCard = ({ icon, value, label }: StatCardProps) => (
    <div className="bg-stone-100/80 p-6 rounded-xl text-center">
        <div className="flex justify-center mb-4 text-amber-600">{icon}</div>
        <p className="text-4xl font-bold font-serif text-stone-900">{value}</p>
        <p className="text-stone-600 mt-1">{label}</p>
    </div>
);

export default function AboutPage() {
    return (
        <div className="bg-white text-stone-800 font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <a href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-stone-900 tracking-tighter">🎤 Echo</span>
                        </a>
                        <div className="hidden md:flex items-center space-x-10">
                            <a href="/about" className="text-stone-800 font-bold transition-colors text-base">About</a>
                            <a href="/submit" className="text-stone-600 hover:text-stone-900 transition-colors text-base">Record a Memory</a>
                            <a href="/explore" className="text-stone-600 hover:text-stone-900 transition-colors text-base">Explore</a>
                        </div>
                        <div className="flex items-center">
                           <a href="#login" className="text-stone-600 hover:text-stone-900 border border-stone-300 hover:border-stone-500 px-4 py-2 rounded-lg transition-colors shadow-sm">Login</a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="overflow-x-hidden">
                
                {/* Hero Section */}
                <header className="bg-white pt-24 pb-28 sm:pt-32 sm:pb-36">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-12 items-center">
                        <AnimatedSection>
                            <div className="relative lg:col-span-2 w-full max-w-md mx-auto lg:max-w-none rounded-xl overflow-hidden shadow-2xl shadow-stone-200">
                               <div className="aspect-square">
                                   <img
                                     src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop"
                                     alt="Close-up of an elderly person's hands writing in a journal, representing the act of preserving a story."
                                     className="object-cover w-full h-full"
                                   />
                               </div>
                            </div>
                        </AnimatedSection>
                        <div className="text-left lg:col-span-3">
                          <AnimatedSection>
                              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-stone-900">
                                Every voice matters.
                              </h1>
                              <blockquote className="mt-6 border-l-4 border-amber-500 pl-6">
                                <p className="text-xl text-stone-600 leading-relaxed">
                                  At Echo, our mission is to preserve and amplify the stories, voices, and cultural wisdom that are too often forgotten or ignored.
                                </p>
                              </blockquote>
                          </AnimatedSection>
                        </div>
                    </div>
                </header>

                {/* Our Mission Section */}
                <section className="py-28 sm:py-36 bg-stone-50 border-y border-stone-200">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedSection>
                            <div className="text-center">
                                 <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">From Voice to Legacy</h2>
                                 <p className="mt-4 text-lg text-stone-600 max-w-3xl mx-auto">
                                    We bridge the gap between powerful oral histories and a global audience. By transcribing, translating, and tagging themes like environment, migration, survival, and tradition, we make these stories searchable, shareable, and timeless.
                                 </p>
                            </div>
                        </AnimatedSection>
                        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <AnimatedSection>
                                {/* Added microinteraction hover effect */}
                                <div className="text-center p-8 bg-white rounded-xl border border-stone-200 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                                    <Leaf size={32} className="mx-auto text-amber-600 mb-4"/>
                                    <h3 className="text-xl font-semibold text-stone-900">Conserve Identity</h3>
                                    <p className="mt-2 text-stone-600 text-base leading-relaxed">We don't just save voices; we preserve the ideas, traditions, and identities they carry.</p>
                                </div>
                            </AnimatedSection>
                             <AnimatedSection>
                                <div className="text-center p-8 bg-white rounded-xl border border-stone-200 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                                    <Globe size={32} className="mx-auto text-amber-600 mb-4"/>
                                    <h3 className="text-xl font-semibold text-stone-900">Global & Accessible</h3>
                                    <p className="mt-2 text-stone-600 text-base leading-relaxed">Making stories from endangered languages and personal archives available to all.</p>
                                </div>
                            </AnimatedSection>
                             <AnimatedSection>
                                <div className="text-center p-8 bg-white rounded-xl border border-stone-200 h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                                    <BookHeart size={32} className="mx-auto text-amber-600 mb-4"/>
                                    <h3 className="text-xl font-semibold text-stone-900">A Shared Future</h3>
                                    <p className="mt-2 text-stone-600 text-base leading-relaxed">Ensuring that crucial wisdom remains a part of our collective human story.</p>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>

                {/* Sustainability Section - Added Pull Quote */}
                <section className="bg-stone-800 text-white py-28 sm:py-36">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                             <AnimatedSection>
                                <div>
                                     <h2 className="font-serif text-3xl sm:text-4xl text-white mb-8">Sustainability Through Storytelling</h2>
                                     <div className="space-y-8 text-lg text-stone-300 leading-relaxed">
                                        <p>
                                            <span className="text-xl font-semibold text-white">Sustainability isn't just about the environment</span> but the continued coexistence of people, cultures, and ideas. While climate sustainability focuses on our planet's resources, cultural sustainability ensures that heritage, language, and tradition endure and adapt in a rapidly changing world.
                                        </p>
                                        <p className="border-l-4 border-amber-500 pl-6 text-xl font-serif italic text-stone-200">
                                            Echo embodies this. We provide a space for people today to share and discover meaningful oral stories, including many that would otherwise never be translated or archived.
                                        </p>
                                     </div>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection>
                                <div className="flex justify-center">
                                     <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=2070&auto=format&fit=crop" alt="A diverse group of people collaborating and sharing ideas in a bright room" className="rounded-xl object-cover shadow-2xl"/>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>
                
                {/* Protecting Tomorrow's Wisdom Section */}
                <section className="py-28 sm:py-36">
                    <AnimatedSection>
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">Meeting Today's Needs, Protecting Tomorrow's Wisdom</h2>
                            <p className="mt-4 text-lg text-stone-600 max-w-3xl mx-auto">
                                We are not only fulfilling a need for more recorded oral history in today's world, but we are also building something that will grow stronger over time—a lasting resource for generations to come. This is the epitome of sustainability.
                            </p>
                        </div>
                    </AnimatedSection>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <AnimatedSection><StatCard icon={<Wind size={40}/>} value="220+" label="Languages lost in India since 1961"/></AnimatedSection>
                        <AnimatedSection><StatCard icon={<Users size={40}/>} value="Billions" label="of stories waiting to be told"/></AnimatedSection>
                        <AnimatedSection><StatCard icon={<BookHeart size={40}/>} value="1 Voice" label="can become a global resource"/></AnimatedSection>
                    </div>
                     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
                         <AnimatedSection>
                             <p className="text-lg text-stone-700 leading-relaxed">
                                Echo strengthens the foundation that future generations will rely on to understand their heritage, languages, and environmental past. As entire knowledge systems fade, Echo steps in to ensure valuable wisdom isn't lost forever.
                             </p>
                         </AnimatedSection>
                     </div>
                </section>
            
            </main>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-300">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    {/* Footer content remains the same */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <a href="/" className="text-xl font-bold text-white">🎤 Echo</a>
                            <p className="mt-2 text-stone-400 text-sm">Hold onto the stories that hold us together.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white tracking-wider uppercase">Navigate</h4>
                            <ul className="mt-4 space-y-2">
                                <li><a href="/about" className="hover:text-amber-400 transition-colors">About</a></li>
                                <li><a href="/submit" className="hover:text-amber-400 transition-colors">Record a Memory</a></li>
                                <li><a href="/explore" className="hover:text-amber-400 transition-colors">Explore</a></li>
                            </ul>
                        </div>
                        <div>
                             <h4 className="font-semibold text-white tracking-wider uppercase">Resources</h4>
                            <ul className="mt-4 space-y-2">
                                <li><a href="/families" className="hover:text-amber-400 transition-colors">For Families</a></li>
                                <li><a href="/educators" className="hover:text-amber-400 transition-colors">For Educators</a></li>
                                <li><a href="/communities" className="hover:text-amber-400 transition-colors">For Communities</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white tracking-wider uppercase">Contact</h4>
                            <ul className="mt-4 space-y-2">
                                <li><a href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
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
