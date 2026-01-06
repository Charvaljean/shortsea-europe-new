
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Waypoint {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  waypoints?: Waypoint[];
  skagenWaypoints?: Waypoint[]; // Voorwaartse compatibiliteit
  showSkagenRoute?: boolean;    // Voorwaartse compatibiliteit
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  origin, 
  destination, 
  waypoints = [], 
  skagenWaypoints = [], 
  showSkagenRoute = false 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialiseer map indien nog niet aanwezig
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [50, 10],
        zoom: 4,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Verwijder oude markers en lijnen
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (!origin || !destination) return;

    const originLatLng: [number, number] = [origin.lat, origin.lng];
    const destLatLng: [number, number] = [destination.lat, destination.lng];

    // Origin Marker (Blauw)
    const fromIcon = L.divIcon({
      html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    L.marker(originLatLng, { icon: fromIcon }).addTo(map).bindPopup(`<strong>Laadhaven:</strong> ${origin.name}`);

    // Destination Marker (Rood)
    const toIcon = L.divIcon({
      html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(239,68,68,0.5);"></div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    L.marker(destLatLng, { icon: toIcon }).addTo(map).bindPopup(`<strong>Loshaven:</strong> ${destination.name}`);

    // Route Tekenen (Stippellijn)
    // Gebruik waypoints indien beschikbaar, anders de directe lijn tussen origin en destination
    const activeWaypoints = (waypoints && waypoints.length > 0) ? waypoints : [origin, destination];
    const path = activeWaypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
    
    L.polyline(path, {
      color: '#1e5aa0',
      weight: 4,
      dashArray: '10, 10',
      opacity: 0.8,
      lineCap: 'round'
    }).addTo(map);

    // Fit Bounds met padding - Cruciaal voor lange routes
    try {
      const bounds = L.latLngBounds([originLatLng, destLatLng, ...path]);
      map.fitBounds(bounds, { 
        padding: [80, 80],
        maxZoom: 7,
        animate: true
      });
    } catch (e) {
      console.warn("Kon map bounds niet berekenen:", e);
    }

  }, [origin, destination, waypoints, skagenWaypoints, showSkagenRoute]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[400px]" 
      style={{ zIndex: 0, position: 'relative' }} 
    />
  );
};

export default MapComponent;
