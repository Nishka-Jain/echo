import React from 'react';

const getHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const SignatureWave = ({ text, className }: { text: string; className?: string }) => {
    const points = 30;
    const hash = getHash(text);
    let pathData = "M 0 50"; // Start path at left-middle

    for (let i = 0; i < points; i++) {
        const x = (i / (points - 1)) * 100;
        const y = (hash >> i) % 50 + 25; // Y-point between 25 and 75
        pathData += ` C ${x-2} ${y}, ${x-2} ${y}, ${x} ${y}`; // Create a smooth curve point
    }

    return (
        <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className={className}
        >
            <path 
                d={pathData} 
                stroke="rgba(180, 83, 9, 0.8)" // This is `amber-700` with opacity
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round"
            />
        </svg>
    );
};

export default SignatureWave;