
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ship, Building2, Phone, Mail, Navigation } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (e) {}

// Custom Ship Icons based on Status
const createShipIcon = (color: string) => L.divIcon({
  className: 'custom-ship-icon',
  html: `<div style="
    background-color: ${color};
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  ">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.9 5.8 2.8 8"/><path d="M5 10l9-4 9 4"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const icons = {
  available: createShipIcon('#10b981'), // Green
  chartered: createShipIcon('#ef4444'), // Red
  maintenance: createShipIcon('#f59e0b'), // Yellow
  default: createShipIcon('#3b82f6') // Blue
};

// Realistic European Port Hubs for Simulation
const PORTS = [
  { lat: 51.9225, lng: 4.47917, name: "Rotterdam" },
  { lat: 53.5488, lng: 9.9872, name: "Hamburg" },
  { lat: 51.2194, lng: 4.4025, name: "Antwerp" },
  { lat: 60.1699, lng: 24.9384, name: "Helsinki" },
  { lat: 59.9139, lng: 10.7522, name: "Oslo" },
  { lat: 43.2630, lng: 5.3698, name: "Marseille" },
  { lat: 44.4056, lng: 8.9463, name: "Genoa" },
  { lat: 37.9422, lng: 23.6530, name: "Piraeus" },
  { lat: 41.3851, lng: 2.1734, name: "Barcelona" },
  { lat: 54.3520, lng: 18.6466, name: "Gdansk" },
  { lat: 53.3498, lng: -6.2603, name: "Dublin" },
  { lat: 38.7223, lng: -9.1393, name: "Lisbon" },
  { lat: 36.1408, lng: -5.3536, name: "Gibraltar" },
  { lat: 40.8518, lng: 14.2681, name: "Naples" },
  { lat: 55.6761, lng: 12.5683, name: "Copenhagen" }
];

const FleetMap: React.FC<{ ships?: any[] }> = ({ ships = [] }) => {
  // Deterministic random location based on ship ID to keep them stable on refresh
  const getShipLocation = (ship: any) => {
    // Safety check for ID
    const sId = (ship?.id || '0').toString();
    const hash = sId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const portIndex = hash % PORTS.length;
    // Add small random offset so they don't stack perfectly
    const offsetLat = (hash % 100 - 50) / 500; 
    const offsetLng = (hash % 50 - 25) / 250;
    
    return {
      lat: PORTS[portIndex].lat + offsetLat,
      lng: PORTS[portIndex].lng + offsetLng,
      hub: PORTS[portIndex].name
    };
  };

  const safeShips = Array.isArray(ships) ? ships : [];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <MapContainer 
        center={[50.0, 10.0]} 
        zoom={4} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {safeShips.map((ship, idx) => {
          if (!ship) return null;
          const loc = getShipLocation(ship);
          const status = (ship.status || 'available').toLowerCase();
          let icon = icons.default;
          
          if (status.includes('available')) icon = icons.available;
          else if (status.includes('chartered')) icon = icons.chartered;
          else if (status.includes('maintenance')) icon = icons.maintenance;

          return (
            <Marker key={ship.id || idx} position={[loc.lat, loc.lng]} icon={icon}>
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b">
                    <span className="font-bold text-slate-800">{ship.name || 'Unknown Vessel'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase text-white ${
                      status.includes('available') ? 'bg-green-500' :
                      status.includes('chartered') ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {ship.status || 'Available'}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                       <Ship size={14} className="text-blue-500"/>
                       <span>{ship.type || 'Coaster'} • {ship.dwt || '---'} DWT</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Navigation size={14} className="text-blue-500"/>
                       <span>Near {loc.hub}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-blue-500"/>
                       <span>{ship.ownerName || 'Unknown Owner'}</span>
                    </div>
                  </div>

                  {(ship.ownerEmail || ship.ownerPhone) && (
                    <div className="mt-3 pt-2 border-t flex gap-2">
                       {ship.ownerPhone && (
                         <a href={`tel:${ship.ownerPhone}`} className="flex-1 bg-green-50 text-green-700 text-xs py-1.5 rounded text-center font-bold hover:bg-green-100 flex justify-center items-center gap-1">
                           <Phone size={12}/> Call
                         </a>
                       )}
                       {ship.ownerEmail && (
                         <a href={`mailto:${ship.ownerEmail}`} className="flex-1 bg-blue-50 text-blue-700 text-xs py-1.5 rounded text-center font-bold hover:bg-blue-100 flex justify-center items-center gap-1">
                           <Mail size={12}/> Email
                         </a>
                       )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs">
          <h4 className="font-bold mb-2 text-slate-700">Fleet Status</h4>
          <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></div> Chartered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow-sm"></div> Maintenance</div>
          </div>
      </div>
    </div>
  );
};

export default FleetMap;
