"use client";

import React from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';

export interface Place {
  name: string;
  lat: number;
  lng: number;
}

interface LocationSearchProps {
  onPlaceSelect: (place: Place | null) => void;
}

export default function LocationSearch({ onPlaceSelect }: LocationSearchProps) {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        fields: ["formatted_address", "geometry.location"],
    });
    
    setPlaceAutocomplete(autocomplete);
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    const listener = placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      if (place.geometry?.location) {
        onPlaceSelect({
            name: place.formatted_address || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        });
      }
    });

    return () => listener.remove();
  }, [placeAutocomplete, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      placeholder="e.g., Oaxaca, Mexico"
      className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
    />
  );
}