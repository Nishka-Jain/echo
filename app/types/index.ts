interface Story {
  id: string;
  imageUrl: string;
  title: string;
  speaker: string; // Added for explore page cards
  excerpt: string;
  tags: string[]; // Changed to an array to support multiple tags
  era?: string; // Optional for flexibility
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
}
  
  