import React from 'react';

const getHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const Voiceprint = ({ text, className }: { text: string; className?: string }) => {
    const barCount = 40; // Increased bar count for more detail
    const bars = [];
    const hash = getHash(text);

    for (let i = 0; i < barCount; i++) {
        // Generate a height between 10% and 100%
        const height = (hash >> i) % 90 + 10; 
        bars.push(
            <div 
                key={i} 
                className="w-1 bg-amber-800 rounded-full" // Slightly darker amber for contrast
                style={{ height: `${height}%` }}
            />
        );
    }

    return (
        // The key change is here: `items-center` aligns the bars to the middle
        <div className={`flex items-center justify-between w-full h-full gap-px ${className}`}>
            {bars}
        </div>
    );
};

export default Voiceprint;