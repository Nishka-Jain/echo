import type { User } from 'firebase/auth';

export type Story = {
  id: string;
  photoUrl?: string; 
  title: string;
  speaker: string;
  age?: string;
  pronouns?: string;
  audioUrl?: string;
  excerpt: string;
  tags: string[];
  createdAt?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
};

export type UserProfile = User & {
  photoPosition?: string;
};