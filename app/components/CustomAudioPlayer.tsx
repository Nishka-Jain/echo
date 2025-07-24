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

      {/* All styling is now self-contained in this block. */}
      <style jsx global>{`
        /* This hides the native browser controls, leaving a blank space for Plyr. */
        .react-plyr-wrapper audio::-webkit-media-controls-panel {
          display: none !important;
        }
        
        /* This hides the buffer bar as requested. */
        .react-plyr-wrapper .plyr__progress__buffer {
          display: none !important;
        }

        /* Your custom theme. */
        .react-plyr-wrapper {
          --plyr-color-main: #6e41e2;
          --plyr-control-radius: 8px;
          --plyr-font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default CustomAudioPlayer;