import type { User } from 'firebase/auth';

export type Story = {
  transcription?: string;
  id: string;
  photoUrl?: string; 
  title: string;
  speaker: string;
  age?: string;
  pronouns?: string;
  audioUrl?: string;
  excerpt: string;
  tags: string[];
  authorId?: string;
  createdAt?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  dateType?: 'period' | 'year';
  startYear?: number | null;
  endYear?: number | null;
  specificYear?: number | null;
  language?: string;
};

export type UserProfile = User & {
  photoPosition?: string;
};