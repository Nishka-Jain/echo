"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

const storyPrompts = [
  "What was the best piece of advice you ever received, and who gave it to you?",
  "What is a controversial opinion you have and what experiences have you had that shaped it?",
  "Can you tell me about the house or neighborhood you grew up in?",
  "What was your first job? What do you remember most about it?",
  "Can you tell me about a time you felt truly proud of yourself?",
  "What is one story from your life that you think your great-grandchildren should hear?",
  "Who was the most influential person in your life growing up? What did you learn from them?",
  "How has the world changed the most in your lifetime, and what has it been like to live through that change?",
  "What's a lesson that took you a long time to learn?",
  "Tell me about a favorite food or meal from your childhood. Who made it for you?",
  "What city have you enjoyed living in the most? Tell me a story about your time there.",
  "Describe a major turning point in your life—a moment when you knew things would not be the same.",
  "Tell me about a friendship that has shaped who you are.",
  "What do you believe is the secret to a happy life?",
  "What's a small thing that people worry about too much?"
];

export default function RandomPromptGenerator() {
  const [prompt, setPrompt] = useState('');

  const generateNewPrompt = () => {
    const randomIndex = Math.floor(Math.random() * storyPrompts.length);
    setPrompt(storyPrompts[randomIndex]);
  };

  useEffect(() => {
    generateNewPrompt();
  }, []);

  return (
    // This div provides the blue background box
    <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
      <div className="mb-3 text-blue-700 text-sm font-medium">
        The prompt below is just a suggestion. You can ignore it and record any story you wish.
      </div>
      <p className="font-sans text-stone-700 text-xl min-h-[96px] flex items-center justify-center mb-6">
        {prompt}
      </p>

      <button
        type="button"
        onClick={generateNewPrompt}
        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 text-sm font-semibold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <RefreshCcw size={14} />
        Get a New Prompt
      </button>
    </div>
  );
}