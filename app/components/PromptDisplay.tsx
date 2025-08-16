"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';

// Define the structure for the questions we'll receive
type PromptSection = {
  subheading: string;
  prompts: string[];
};

interface PromptDisplayProps {
  sections: PromptSection[];
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ sections }) => {
  // Combine all prompts from all sections into a single flat array
  const allPrompts = sections.flatMap(section => 
    section.prompts.map(prompt => ({ subheading: section.subheading, prompt }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (allPrompts.length === 0) {
    return null; // Don't render if there are no prompts
  }

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? allPrompts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === allPrompts.length - 1 ? 0 : prev + 1));
  };
  
  const currentItem = allPrompts[currentIndex];

  return (
    <div className="mb-8 p-6 bg-stone-50 border border-stone-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-stone-800">Need an idea?</h3>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900"
        >
          <List size={16} />
          {showAll ? 'Hide All' : 'Show All'}
        </button>
      </div>

      {showAll ? (
        <div className="space-y-4 animate-fade-in text-stone-700">
          {sections.map(section => (
            <div key={section.subheading}>
              <h4 className="font-semibold text-stone-800 mb-2">{section.subheading}</h4>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {section.prompts.map((prompt, i) => <li key={i}>{prompt}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center animate-fade-in">
          <p className="text-sm font-medium text-stone-500 mb-2">{currentItem.subheading}</p>
          <p className="text-xl text-stone-800 min-h-[60px] flex items-center justify-center">
            {currentItem.prompt}
          </p>
          <div className="mt-4 flex justify-center items-center gap-4">
            <button onClick={handlePrev} className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-stone-600 font-mono">{currentIndex + 1} / {allPrompts.length}</span>
            <button onClick={handleNext} className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDisplay;