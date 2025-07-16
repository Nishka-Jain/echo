"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface Place {
  name: string;
  lat: number;
  lng: number;
}

// ✨ FIX: Added 'initialValue' to the props
interface LocationSearchProps {
  onPlaceSelect: (place: Place | null) => void;
  initialValue?: string;
}

export default function LocationSearch({ onPlaceSelect, initialValue = '' }: LocationSearchProps) {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  // ✨ FIX: Use useEffect to set the initial value of the input field
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.value = initialValue;
    }
  }, [initialValue]);


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
      className="w-full p-3 border border-stone-300 rounded-lg text-stone-900"
    />
  );
}