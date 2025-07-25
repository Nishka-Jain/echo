"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookHeart, Globe, Leaf, Users } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import Navbar from '@/app/components/Navbar';

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


export default function AboutPage() {
  return (
    <div className="bg-white text-stone-800 font-sans">
      <Navbar />

      <main className="overflow-hidden">
        <AnimatedSection>
            <header className="bg-white pt-20 pb-12 sm:pt-22 sm:pb-10">
              <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif tracking-tight text-stone-900">
                      A Bridge Between Generations.
                    </h1>
                    <p className="mt-8 max-w-3xl mx-auto text-lg lg:text-xl text-stone-600 leading-relaxed">
                      Echo empowers students and families alike to preserve the irreplaceable wisdom of human experience, ensuring that every voice can be heard for generations to come.
                    </p>
              </div>
            </header>
        </AnimatedSection>
        <section className="pt-12 pb-24 sm:pt-20 sm:pb-28">
              <div className="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
                <div className="grid md:grid-cols-2 gap-16 md:gap-24">

                  <div className="flex items-center">
                    <div className="grid grid-cols-3 grid-rows-3 gap-4 h-[500px] w-full">
                      <div className="col-span-2 row-span-1 relative rounded-lg overflow-hidden">
                        <Image src="/bwfishing.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                      <div className="col-span-1 row-span-2 relative rounded-lg overflow-hidden">
                        <Image src="/bwtunnel.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                        <Image src="/bwkid.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>

                      <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                        <Image src="/drag.jpg" alt="Description" layout="fill" className="object-cover" />
                      </div>
                    
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
        
        <section className="bg-stone-900 text-white py-22 sm:py-28">
          <div className="max-w-5xl mx-auto px-8 sm:px-10 lg:px-12">
            <AnimatedSection>
              <div className="text-center">
                <h2 className="font-serif text-3xl lg:text-5xl">Our Guiding Principles</h2>
                <p className="mt-6 text-lg text-stone-300 max-w-2xl mx-auto">These ideas are the foundation of everything we build.</p>
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
                    <p className="mt-2 text-stone-300 leading-relaxed">We build a classroom across time, ensuring future generations can learn directly from the voices and wisdom of the past.</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <AnimatedSection>
          <section className="bg-white py-22 sm:py-28 border-y border-stone-200">
            <div className="max-w-5xl mx-auto px-8 sm:px-10 lg:px-12">
              <div className="text-center mb-16">
                <h2 className="font-serif text-3xl lg:text-4xl text-stone-900">The Reason We Began</h2>
                <p className="mt-6 text-lg text-stone-600">A word from our founders.</p>
              </div>

              <div className="space-y-20">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
                  <div className="md:col-span-1 flex justify-center md:justify-end md:order-last">
                    <Image
                      src="/nishka.png" 
                      alt="Picture of Nishka Jain"
                      width={220}
                      height={220}
                      className="rounded-full object-cover aspect-square object-top"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <blockquote className="font-serif text-xl lg:text-2xl text-black leading-relaxed">
                      "Echo began when I found an old, faded photograph of my great-grandparents. I saw their kind eyes and felt the profound loss of the stories they could never tell me—a history class I could never take, a mentorship I would never receive. It was then I knew we had to build a library for those unwritten lessons, a way to ensure a legacy of love and learning endures."
                    </blockquote>
                    <cite className="mt-6 block font-semibold text-black not-italic">
                      Nishka Jain
                      <span className="ml-2 font-normal text-stone-800">(Co-Founder)</span>
                    </cite>
                  </div>
                </div>

                <hr className="border-stone-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
                  <div className="md:col-span-1 flex justify-center md:justify-start">
                    <Image
                      src="/angela.png" 
                      alt="Picture of Angela Li"
                      width={220}
                      height={220}
                      className="rounded-full object-cover aspect-square object-top"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <blockquote className="font-serif text-xl lg:text-2xl text-black leading-relaxed">
                    "We live in an age of endless information, but we're starving for wisdom. That wisdom isn't in a database; it's in the cadence of our elders' voices, in the stories shared across generations. Echo is our way of building a new kind of library—not of data, but of humanity itself."
                    </blockquote>
                    <cite className="mt-6 block font-semibold text-black not-italic">
                      Angela Li
                      <span className="ml-2 font-normal text-stone-800">(Co-Founder)</span>
                    </cite>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section id="contact" className="bg-white py-22 sm:py-28 border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-15">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                <div className="md:col-span-1">
                  <h2 className="font-serif text-3xl lg:text-4xl text-stone-900">
                    Have a story to share? Let's talk.
                  </h2>
                </div>

                <div className="md:col-span-2 md:border-l md:border-stone-200 md:pl-16">
                  <h3 className="text-lg font-semibold text-stone-800">General Inquiries & Partnerships</h3>
                  <p className="mt-2 text-stone-600">
                    We’d love to hear from you. Whether you have a question about our mission, an idea for collaboration, or simply want to share your thoughts, please don’t hesitate to reach out.
                  </p>
                  <div className="mt-6">
                    <a 
                      href="mailto:contact.echoarchive@gmail.com"
                      className="inline-flex items-center justify-center gap-2 text-lg font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      contact.echoarchive@gmail.com
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </AnimatedSection>
      </main>

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