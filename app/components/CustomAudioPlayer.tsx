"use client";

import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';

// This component does NOT import any CSS. Styling is handled inside.
interface CustomAudioPlayerProps {
  src: string;
}

const CustomAudioPlayer = ({ src }: CustomAudioPlayerProps) => {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This check is important.
    if (!ref.current) {
      return;
    }

    // Initialize Plyr. This is the code that runs on mount.
    const player = new Plyr(ref.current);

    // This is the cleanup function that runs on unmount.
    return () => {
      // The try/catch block handles the StrictMode error gracefully.
      try {
        player.destroy();
      } catch (error) {
        if ((error as DOMException).name !== 'NotFoundError') {
          throw error;
        }
      }
    };
  }, []); // The empty array ensures this effect runs only once per mount/unmount cycle.

  return (
    // We use a wrapper div to reliably target our styles.
    <div className="react-plyr-wrapper">
      {/* The 'controls' attribute ensures the element is visible before Plyr takes over. */}
      <audio ref={ref} controls src={src} />
    </div>
  );
};

export default CustomAudioPlayer;