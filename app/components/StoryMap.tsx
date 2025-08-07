"use client";

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L, { divIcon } from 'leaflet';
import Link from 'next/link';
import type { Story } from '@/lib/types';
import { Languages, Calendar } from 'lucide-react';
import "leaflet/dist/leaflet.css"; // Essential for Leaflet styles

// Helper function to format dates remains the same
const formatStoryDate = (story: Story): string | null => {
    if (story.dateType === 'year' && story.specificYear) return story.specificYear.toString();
    if (story.dateType === 'period') {
        if (story.startYear && story.endYear) {
            if (story.startYear === story.endYear) return story.startYear.toString();
            return `${story.startYear} - ${story.endYear}`;
        }
        if (story.startYear) return `From ${story.startYear}`;
    }
    return null;
};

// SingleStoryPopup component remains the same
const SingleStoryPopup = ({ story }: { story: Story }) => {
    const displayDate = formatStoryDate(story);
    return (
        <div className="font-sans w-48">
            <h3 className="font-bold font-serif text-lg mb-2 line-clamp-2">{story.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {displayDate && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-stone-100 text-stone-600 rounded-full">
                        <Calendar size={12} />
                        {displayDate}
                    </span>
                )}
                {story.language && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        <Languages size={12} />
                        {story.language}
                    </span>
                )}
            </div>
            <p className="text-stone-600 mb-2 text-sm">by {story.speaker}</p>
            <Link href={`/story/${story.id}`} className="text-amber-700 font-semibold hover:underline mt-1 mb-1 inline-block text-sm">
                Listen to Story &rarr;
            </Link>
        </div>
    );
};

// MultiStoryPopup component remains the same
const MultiStoryPopup = ({ stories }: { stories: Story[] }) => (
    <div className="font-sans w-64">
        <h3 className="font-serif font-bold text-lg mb-2 border-b pb-1">
            {stories.length} Stories at this Location
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-2 divide-y divide-stone-100 pr-1">
            {stories.map(story => {
                const displayDate = formatStoryDate(story);
                return (
                    <div key={story.id} className="pt-2 first:pt-0">
                         <p className="font-semibold text-stone-800 line-clamp-1">{story.title}</p>
                         <p className="text-sm text-stone-500 mb-2">by {story.speaker}</p>
                         <div className="flex flex-wrap items-center gap-2 mb-2">
                             {displayDate && (
                                <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">
                                    <Calendar size={12} />
                                    {displayDate}
                                </span>
                            )}
                            {story.language && (
                                <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                    <Languages size={12} />
                                    {story.language}
                                </span>
                            )}
                         </div>
                        <Link href={`/story/${story.id}`} className="text-xs font-semibold text-amber-700 hover:underline mt-2 mb-3 inline-block">
                            Listen to Story &rarr;
                        </Link>
                    </div>
                )
            })}
        </div>
    </div>
);

// --- MODIFICATION 1: UPDATED ICON CREATION ---
// The function now accepts an `isSelected` boolean to apply a different style.
const createClusterIcon = (count: number, isSelected: boolean) => {
  // A glowing effect for the selected marker
  const selectedStyle = isSelected 
    ? 'box-shadow: 0 0 12px 4px #FBBF24; border-radius: 9999px; transition: box-shadow 0.3s;' 
    : '';

  return divIcon({
    html: `
      <div class="relative" style="${selectedStyle}">
        <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" style="width: 28px; height: 28px;" />
        ${count > 1 ? `
          <span class="absolute -top-1 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
            ${count}
          </span>
        ` : ''}
      </div>
    `,
    className: 'bg-transparent border-0',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

// --- MODIFICATION 2: NEW PROPS INTERFACE ---
interface StoryMapProps {
  stories: Story[];
  selectedStoryId: string | null;
  onMapClick: () => void;
}

// --- MODIFICATION 3: NEW HELPER COMPONENTS ---
// This component handles clicking on the map to deselect a story.
const MapClickHandler = ({ onMapClick }: { onMapClick: () => void }) => {
    useMapEvents({
        click: () => {
            onMapClick();
        },
    });
    return null;
};

// This component handles the logic for flying to and opening the popup of a selected marker.
const HighlightHandler = ({ groupedStories, selectedStoryId, markerRefs }: any) => {
    const map = useMap();
    useEffect(() => {
        if (!selectedStoryId) return;

        let targetGroupKey: string | null = null;
        for (const [key, group] of groupedStories.entries()) {
            if (group.some((s: Story) => s.id === selectedStoryId)) {
                targetGroupKey = key;
                break;
            }
        }

        if (targetGroupKey && markerRefs.current.has(targetGroupKey)) {
            const marker = markerRefs.current.get(targetGroupKey);
            if (marker) {
                const latLng = marker.getLatLng();
                // Fly to the location and open the popup
                map.flyTo(latLng, Math.max(map.getZoom(), 10), { duration: 1 });
                marker.openPopup();
            }
        }
    }, [selectedStoryId, groupedStories, map, markerRefs]);

    return null;
}

// --- MODIFICATION 4: UPDATED STORYMAP COMPONENT ---
const StoryMap = ({ stories = [], selectedStoryId, onMapClick }: StoryMapProps) => {
  const storiesWithLocation = stories.filter(story => story.location?.lat && story.location?.lng);
  
  // A ref to store all marker instances, mapping a location key to a marker.
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  const groupedStories = useMemo(() => {
    const groups = new Map<string, Story[]>();
    storiesWithLocation.forEach(story => {
        const key = `${story.location!.lat},${story.location!.lng}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)?.push(story);
    });
    return groups;
  }, [storiesWithLocation]);

  return (
    <MapContainer center={[25, 0]} zoom={2} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />
        
        {/* Add the event handler components to the map */}
        <MapClickHandler onMapClick={onMapClick} />
        <HighlightHandler 
            groupedStories={groupedStories} 
            selectedStoryId={selectedStoryId}
            markerRefs={markerRefs} 
        />
      
        {Array.from(groupedStories.entries()).map(([key, storiesInGroup]) => {
            const position = { lat: storiesInGroup[0].location!.lat, lng: storiesInGroup[0].location!.lng };
            
            // Check if the currently selected story is in this group
            const isSelected = storiesInGroup.some(s => s.id === selectedStoryId);
            const icon = createClusterIcon(storiesInGroup.length, isSelected);

            return (
                <Marker 
                    key={key} 
                    position={[position.lat, position.lng]}
                    icon={icon}
                    // Store the marker instance in our ref map
                    ref={(el) => { if (el) { markerRefs.current.set(key, el); } }}
                >
                    <Popup>
                        {storiesInGroup.length === 1 ? (
                            <SingleStoryPopup story={storiesInGroup[0]} />
                        ) : (
                            <MultiStoryPopup stories={storiesInGroup} />
                        )}
                    </Popup>
                </Marker>
            );
        })}
    </MapContainer>
  );
};

export default StoryMap;