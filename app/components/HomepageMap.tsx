
"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import type { Story } from '@/lib/types'; // Assuming your type is in this path

// --- FIX LEAFLET'S DEFAULT ICON ---
// This is a common issue in React environments where the default icon path is not resolved correctly.
// By creating a new icon instance, we can explicitly set the correct paths.
const customIcon = new L.Icon({
    iconUrl: '/marker-icon.png', // Make sure you have this icon in your /public folder
    iconRetinaUrl: '/marker-icon-2x.png', // Make sure you have this icon in your /public folder
    shadowUrl: '/marker-shadow.png', // Make sure you have this icon in your /public folder
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
// You can download the default leaflet icons from the official leaflet website or a node package.

interface HomepageMapProps {
  stories: Story[];
}

export default function HomepageMap({ stories }: HomepageMapProps) {
  // Use the location of the first story as the initial center, or a default value
  const initialPosition: L.LatLngExpression = stories[0]?.location
    ? [stories[0].location.lat, stories[0].location.lng]
    : [40.7128, -74.0060]; // Default to New York City if no stories have locations

  return (
    <MapContainer
        center={initialPosition}
        zoom={2}
        scrollWheelZoom={false} // It's good practice to disable scroll zoom by default on embedded maps
        className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stories.map(story => {
        // Ensure the story has a location with lat and lng before creating a marker
        if (story.location && typeof story.location.lat === 'number' && typeof story.location.lng === 'number') {
          return (
            <Marker 
              key={story.id} 
              position={[story.location.lat, story.location.lng]}
              icon={customIcon} // Use the corrected custom icon
            >
              <Popup>
                <strong>{story.title}</strong>
                <p>Speaker: {story.speaker}</p>
                <a href={`/story/${story.id}`} className="text-amber-700 font-semibold">View Story</a>
              </Popup>
            </Marker>
          )
        }
        return null;
      })}
    </MapContainer>
  );
}