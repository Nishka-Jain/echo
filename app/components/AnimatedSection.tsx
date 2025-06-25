"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
}

const AnimatedSection = ({ children }: AnimatedSectionProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If the element is intersecting (i.e., in the viewport), set it to visible
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Stop observing the element once it's visible to save resources
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1, // Trigger animation when 10% of the element is visible
                rootMargin: '0px 0px -50px 0px', // Start animation a bit before it's fully in view
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        // Cleanup function to unobserve the element when the component unmounts
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            // This applies the transition effect. When isVisible is true, opacity goes to 100 and translateY to 0.
            className={`transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
            {children}
        </div>
    );
};

export default AnimatedSection;