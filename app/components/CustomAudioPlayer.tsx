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

      <style jsx global>{`
        /* This hides the native browser controls */
        .react-plyr-wrapper audio::-webkit-media-controls-panel {
          display: none !important;
        }
        
        /* This hides the buffer bar */
        .react-plyr-wrapper .plyr__progress__buffer {
          display: none !important;
        }

        /* Your custom theme and background color */
        .react-plyr-wrapper {
          /* Add this line to set the player's background color */
          --plyr-control-background: #fafaf9; /* This is the hex code for stone-50 */

          --plyr-color-main: #6e41e2; /* This is the purple for the progress bar */
          --plyr-control-radius: 12px;
          --plyr-font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default CustomAudioPlayer;