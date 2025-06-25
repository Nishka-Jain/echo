"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import Link from 'next/link';


// Create a custom icon for the map markers
const customIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [38, 38], // size of the icon
});

interface StoryMapProps {
  stories: Story[];
}

const StoryMap = ({ stories }: StoryMapProps) => {
  // Filter stories to only include those with location data
  const storiesWithLocation = stories.filter(story => story.location);

  return (
    <MapContainer 
      center={[20, 0]} // Start with a view of the whole world
      zoom={2} 
      scrollWheelZoom={true} 
      className="h-[600px] w-full rounded-xl border border-stone-300"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {storiesWithLocation.map((story) => (
        story.location && (
          <Marker 
            key={story.id} 
            position={[story.location.lat, story.location.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold font-serif text-lg mb-1">{story.title}</h3>
                <p className="text-stone-600 mb-2">by {story.speaker}</p>
                <Link href={`/story/${story.id}`} className="text-amber-700 font-semibold hover:underline">
                  Listen to Story &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default StoryMap;
