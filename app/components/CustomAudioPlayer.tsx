"use client";

import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';

interface CustomAudioPlayerProps {
  src: string;
}

const CustomAudioPlayer = ({ src }: CustomAudioPlayerProps) => {
  // This ref will point to our wrapper div, not the audio element itself.
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // --- Setup ---
    // 1. Programmatically create a fresh <audio> element.
    const audio = document.createElement('audio');
    audio.src = src;
    audio.controls = true;

    // 2. Append it to our wrapper div.
    wrapperRef.current.appendChild(audio);

    // 3. Initialize Plyr on the new element.
    const player = new Plyr(audio);

    // --- Cleanup ---
    return () => {
      // 4. Destroy the Plyr instance.
      player.destroy();
      
      // 5. CRITICAL STEP: Remove all inner content from the wrapper.
      // This throws away the old, modified <audio> element, ensuring the
      // next run starts from a completely clean slate.
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = '';
      }
    };
  }, [src]); // We add `src` as a dependency to re-create the player if the audio source changes.

  return (
    // The JSX now only contains the wrapper div and the styles.
    <div ref={wrapperRef} className="react-plyr-wrapper">
      <style jsx global>{`
        .react-plyr-wrapper .plyr--audio {
          background: #fafaf9 !important; /* stone-50 color */
        }
        /* Other styles remain the same... */
        .react-plyr-wrapper {
          --plyr-color-main: #6e41e2;
          --plyr-control-radius: 12px;
        }
        .react-plyr-wrapper .plyr__progress__buffer {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default CustomAudioPlayer;