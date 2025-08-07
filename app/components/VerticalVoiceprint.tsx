import React from 'react';

const getHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const VerticalVoiceprint = ({ text, className }: { text: string; className?: string }) => {
    const barCount = 20;
    const bars = [];
    const hash = getHash(text);

    for (let i = 0; i < barCount; i++) {
        const width = (hash >> i) % 70 + 30; // Width between 30% and 100%
        bars.push(
            <div key={i} className="h-0.5 bg-amber-800 rounded-full" style={{ width: `${width}%` }}/>
        );
    }
    return (
        <div className={`flex flex-col items-center justify-between w-full h-full gap-px ${className}`}>
            {bars}
        </div>
    );
};

export default VerticalVoiceprint;