
import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useLanguage } from '../App'
import { useAuth } from '../context/AuthContext'
import { calculateRouteDistance } from '../services/geminiService'
import {
  ArrowLeft,
  Ship,
  Calculator,
  Trash2,
  Waves,
  Search,
  Globe,
  Map as MapIcon,
  Anchor,
  Fuel,
  Gauge,
  X
} from "lucide-react"

// Declare global Leaflet types
declare global {
  interface Window {
    L: any
  }
}

interface PortCoordinates {
  lat: number;
  lng: number;
  name: string;
}

export default function DistanceCalculatorPage({ onClose }: { onClose?: () => void }) {
  const { t, language, setLanguage } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const mapRef = useRef<any>(null)
  
  // Inputs
  const [fromPort, setFromPort] = useState("")
  const [toPort, setToPort] = useState("")
  const [viaKiel, setViaKiel] = useState(false)
  const [viaCorinth, setViaCorinth] = useState(false)
  const [shipType, setShipType] = useState("")
  const [customSpeed, setCustomSpeed] = useState("")
  const [useCustomSpeed, setUseCustomSpeed] = useState(false)
  const [fuelConsumptionPerDay, setFuelConsumptionPerDay] = useState("")
  const [useCustomFuel, setUseCustomFuel] = useState(false)
  
  // State
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("calculator")
  const [mapLoaded, setMapLoaded] = useState(false)

  const shipTypes = {
    "Shortsea Container": { minSpeed: 14, maxSpeed: 18, avgSpeed: 16, fuelConsumption: 25 },
    "Ro-Ro Schip": { minSpeed: 16, maxSpeed: 20, avgSpeed: 18, fuelConsumption: 28 },
    "Bulk Carrier": { minSpeed: 12, maxSpeed: 15, avgSpeed: 13, fuelConsumption: 22 },
    "Chemical Tanker": { minSpeed: 13, maxSpeed: 16, avgSpeed: 14, fuelConsumption: 24 },
  } as const

  const knownPorts: { [key: string]: PortCoordinates } = {
    "rotterdam": { lat: 51.9225, lng: 4.47917, name: "Port of Rotterdam, Netherlands" },
    "amsterdam": { lat: 52.3731, lng: 4.8922, name: "Port of Amsterdam, Netherlands" },
    "sluiskil": { lat: 51.2794, lng: 3.8367, name: "Sluiskil, Netherlands" },
    "terneuzen": { lat: 51.3333, lng: 3.8333, name: "Terneuzen, Netherlands" },
    "vlissingen": { lat: 51.4500, lng: 3.5833, name: "Vlissingen, Netherlands" },
    "flushing": { lat: 51.4500, lng: 3.5833, name: "Vlissingen (Flushing), Netherlands" },
    "delfzijl": { lat: 53.3333, lng: 6.9333, name: "Delfzijl, Netherlands" },
    "groningen": { lat: 53.2194, lng: 6.5664, name: "Groningen Seaports, Netherlands" },
    "harlingen": { lat: 53.1733, lng: 5.4181, name: "Harlingen, Netherlands" },
    "den helder": { lat: 52.9583, lng: 4.7583, name: "Den Helder, Netherlands" },
    "ijmuiden": { lat: 52.4619, lng: 4.5556, name: "IJmuiden, Netherlands" },
    "antwerpen": { lat: 51.2294, lng: 4.4055, name: "Port of Antwerp, Belgium" },
    "zeebrugge": { lat: 51.3319, lng: 3.2078, name: "Port of Zeebrugge, Belgium" },
    "gent": { lat: 51.0833, lng: 3.7333, name: "Port of Ghent, Belgium" },
    "ghent": { lat: 51.0833, lng: 3.7333, name: "Port of Ghent, Belgium" },
    "brussel": { lat: 50.8667, lng: 4.3333, name: "Port of Brussels, Belgium" },
    "hamburg": { lat: 53.5414, lng: 9.9661, name: "Port of Hamburg, Germany" },
    "bremen": { lat: 53.1074, lng: 8.7850, name: "Port of Bremen, Germany" },
    "bremerhaven": { lat: 53.5500, lng: 8.5767, name: "Port of Bremerhaven, Germany" },
    "wilhelmshaven": { lat: 53.5167, lng: 8.1167, name: "Wilhelmshaven, Germany" },
    "emden": { lat: 53.3667, lng: 7.2000, name: "Emden, Germany" },
    "duisburg": { lat: 51.4342, lng: 6.7600, name: "Duisburg, Germany" },
    "gävle": { lat: 60.6833, lng: 17.1667, name: "Port of Gävle, Sweden" },
    "stockholm": { lat: 59.3294, lng: 18.0686, name: "Port of Stockholm, Sweden" },
    "gothenburg": { lat: 57.7089, lng: 11.9714, name: "Port of Gothenburg, Sweden" },
    "malmö": { lat: 55.6058, lng: 13.0031, name: "Port of Malmö, Sweden" },
    "helsingborg": { lat: 56.0500, lng: 12.7000, name: "Helsingborg, Sweden" },
    "london": { lat: 51.4975, lng: 0.1236, name: "Port of London, UK" },
    "felixstowe": { lat: 51.9565, lng: 1.3167, name: "Port of Felixstowe, UK" },
    "southampton": { lat: 50.8983, lng: -1.3983, name: "Port of Southampton, UK" },
    "liverpool": { lat: 53.4083, lng: -3.0083, name: "Port of Liverpool, UK" },
    "le havre": { lat: 49.4856, lng: 0.1075, name: "Port of Le Havre, France" },
    "dunkerque": { lat: 51.0536, lng: 2.3628, name: "Port of Dunkerque, France" },
    "calais": { lat: 50.9667, lng: 1.8500, name: "Calais, France" },
    "rouen": { lat: 49.4406, lng: 1.0653, name: "Rouen, France" },
    "gdansk": { lat: 54.3667, lng: 18.6333, name: "Port of Gdańsk, Poland" },
    "gdynia": { lat: 54.5333, lng: 18.5500, name: "Port of Gdynia, Poland" },
    "szczecin": { lat: 53.4247, lng: 14.5828, name: "Port of Szczecin, Poland" },
    "stettin": { lat: 53.4247, lng: 14.5828, name: "Port of Szczecin (Stettin), Poland" },
    "oslo": { lat: 59.9139, lng: 10.7522, name: "Port of Oslo, Norway" },
    "bergen": { lat: 60.3975, lng: 5.3236, name: "Port of Bergen, Norway" },
    "copenhagen": { lat: 55.6761, lng: 12.5683, name: "Port of Copenhagen, Denmark" },
    "aarhus": { lat: 56.1569, lng: 10.2108, name: "Port of Aarhus, Denmark" },
    "barcelona": { lat: 41.3500, lng: 2.1667, name: "Port of Barcelona, Spain" },
    "valencia": { lat: 39.4561, lng: -0.3197, name: "Port of Valencia, Spain" },
    "bilbao": { lat: 43.3417, lng: -3.0533, name: "Port of Bilbao, Spain" },
    "genoa": { lat: 44.4072, lng: 8.9344, name: "Port of Genoa, Italy" },
    "naples": { lat: 40.8450, lng: 14.2583, name: "Port of Naples, Italy" },
    "dublin": { lat: 53.3478, lng: -6.2597, name: "Port of Dublin, Ireland" },
    "helsinki": { lat: 60.1699, lng: 24.9384, name: "Port of Helsinki, Finland" },
    "riga": { lat: 56.9489, lng: 24.1064, name: "Port of Riga, Latvia" },
  }

  // Auth protection
  useEffect(() => {
    if (!isAuthenticated && !onClose) {
      navigate("/login")
    }
  }, [isAuthenticated, navigate, onClose])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const initializeMaritimeMap = (waypoints: { lat: number, lng: number }[], originName: string, destName: string) => {
    const mapContainer = document.getElementById('route-map')
    if (!mapContainer || !window.L || !waypoints || waypoints.length === 0) return

    if (mapRef.current) {
      mapRef.current.remove()
    }

    const map = window.L.map('route-map', { preferCanvas: true })
    mapRef.current = map

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    window.L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: '© OpenSeaMap contributors',
      maxZoom: 18,
      opacity: 0.6
    }).addTo(map)

    const wpArray = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);

    // Markers
    const from = wpArray[0];
    const to = wpArray[wpArray.length - 1];

    if (from) {
      const fromIcon = window.L.divIcon({
        html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">↖</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      window.L.marker(from, { icon: fromIcon }).addTo(map).bindPopup(`<strong>${originName}</strong>`);
    }
    
    if (to) {
      const toIcon = window.L.divIcon({
        html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">↘</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      window.L.marker(to, { icon: toIcon }).addTo(map).bindPopup(`<strong>${destName}</strong>`);
    }

    // Polyline (Dashed)
    window.L.polyline(wpArray, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.9,
      dashArray: '12, 12',
      lineCap: 'round'
    }).addTo(map);

    const bounds = window.L.latLngBounds(wpArray)
    map.fitBounds(bounds, { padding: [60, 60] })
    setMapLoaded(true)
  }

  const loadLeafletMaritime = () => {
    if (!results?.waypoints || results.waypoints.length === 0) return

    if (window.L) {
      initializeMaritimeMap(results.waypoints, results.fromName, results.toName)
      return
    }

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.onload = loadLeafletScript
      document.head.appendChild(link)
    } else {
      loadLeafletScript()
    }
  }

  const loadLeafletScript = () => {
    if (window.L) {
      if (results?.waypoints && results.waypoints.length > 0) initializeMaritimeMap(results.waypoints, results.fromName, results.toName)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      if (results?.waypoints && results.waypoints.length > 0) initializeMaritimeMap(results.waypoints, results.fromName, results.toName)
      setMapLoaded(true)
    }
    document.head.appendChild(script)
  }

  const calculateRoute = async () => {
    if (!fromPort.trim() || !toPort.trim()) {
      alert("Voer zowel laadhaven als loshaven in")
      return
    }
    setLoading(true)
    try {
      // COPY OF FREIGHT INDICATION NAVIGATION LOGIC
      const routeData = await calculateRouteDistance(fromPort, toPort, { viaKiel, viaCorinth });

      const selectedShipType = shipTypes[shipType as keyof typeof shipTypes]
      const speed = useCustomSpeed ? parseFloat(customSpeed) : selectedShipType?.avgSpeed || 16
      const baseFuel = useCustomFuel ? parseFloat(fuelConsumptionPerDay) : selectedShipType?.fuelConsumption || 25

      if (useCustomSpeed && (isNaN(speed) || speed < 5 || speed > 30)) {
        alert("Snelheid moet tussen 5 en 30 knopen zijn")
        setLoading(false)
        return
      }
      if (useCustomFuel && (isNaN(baseFuel) || baseFuel < 5 || baseFuel > 40)) {
        alert("Brandstofverbruik moet tussen 5 en 40 ton/dag zijn")
        setLoading(false)
        return
      }

      // The routeData.distance is now path-based (sum of segments)
      const distance = routeData.distance;
      const timeHours = distance / speed
      const timeDays = timeHours / 24
      const totalFuel = Math.round(timeDays * baseFuel)
      const fuelCost = Math.round(totalFuel * 650) // estimated MGO price

      const finalResults = {
        distance: Math.round(distance),
        speed,
        timeDays: timeDays.toFixed(2),
        fuelConsumption: totalFuel,
        fuelConsumptionPerDay: baseFuel,
        fuelCost,
        fromName: fromPort,
        toName: toPort,
        routeType: routeData.routeDescription || "Sea Route",
        distanceMultiplier: "1.0", // AI/Path-based already
        usedCustomSpeed: useCustomSpeed,
        usedCustomFuel: useCustomFuel,
        waypoints: routeData.waypoints || [] 
      }

      setResults(finalResults)

      if (activeTab === "map" && finalResults.waypoints.length > 0) {
        setTimeout(() => loadLeafletMaritime(), 500)
      }
    } catch (error: any) {
      alert(error.message || "Er is iets misgegaan bij het berekenen van de route.")
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setFromPort("")
    setToPort("")
    setShipType("")
    setCustomSpeed("")
    setUseCustomSpeed(false)
    setFuelConsumptionPerDay("")
    setUseCustomFuel(false)
    setViaKiel(false)
    setViaCorinth(false)
    setResults(null)
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
    setMapLoaded(false)
  }

  useEffect(() => {
    if (activeTab === "map" && results?.waypoints && results.waypoints.length > 0) {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      setTimeout(() => loadLeafletMaritime(), 100)
    }
  }, [activeTab, results])

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white', marginBottom: '32px' }}>
        <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onClose ? (
               <button 
                 onClick={onClose}
                 style={{
                   padding: '8px 16px',
                   border: '1px solid #d1d5db',
                   borderRadius: '6px',
                   backgroundColor: 'white',
                   color: '#374151',
                   fontSize: '14px',
                   fontWeight: '500',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '8px'
                 }}
               >
                 <X style={{ width: '16px', height: '16px' }} />
                 Sluiten
               </button>
            ) : (
                <Link to="/dashboard">
                <button style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <ArrowLeft style={{ width: '16px', height: '16px' }} />
                    Terug naar Dashboard
                </button>
                </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Anchor style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
                Geavanceerde Zeeafstand Calculator
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'nl' : 'en')}
            className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-slate-900 border px-3 py-1 rounded-md bg-white"
          >
            <Globe size={16} />
            <span>{language === 'en' ? 'EN' : 'NL'}</span>
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        padding: '4px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        {[
          { id: "calculator", label: "Calculator", icon: Calculator },
          { id: "map", label: "Interactieve Kaart", icon: MapIcon },
          { id: "search", label: "Haven Zoeken", icon: Search },
          { id: "atlas", label: "Haven Atlas", icon: Globe }
        ].map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                border: 'none',
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <IconComponent style={{ width: '16px', height: '16px' }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "calculator" && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Ship style={{ width: '20px', height: '20px' }} />
              Geavanceerde Calculator
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Laadhaven *
                </label>
                <input
                  type="text"
                  value={fromPort}
                  onChange={(e) => setFromPort(e.target.value)}
                  placeholder="Bijv: rotterdam, gävle, antwerpen"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Loshaven *
                </label>
                <input
                  type="text"
                  value={toPort}
                  onChange={(e) => setToPort(e.target.value)}
                  placeholder="Bijv: hamburg, stockholm, le havre"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Route Opties (Canals)
                </h4>
                <div className="flex flex-col space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={viaKiel} 
                      onChange={(e) => setViaKiel(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Via Kiel Canal (Baltic/North Sea)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={viaCorinth} 
                      onChange={(e) => setViaCorinth(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Via Corinth Canal (Greece)</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Scheepstype
                </label>
                <select
                  value={shipType}
                  onChange={(e) => setShipType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="">Selecteer</option>
                  {Object.entries(shipTypes).map(([type, data]) => (
                    <option key={type} value={type}>
                      {type} ({data.avgSpeed} knopen, {data.fuelConsumption}t/dag)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="useCustomSpeed"
                  checked={useCustomSpeed}
                  onChange={(e) => setUseCustomSpeed(e.target.checked)}
                />
                <label htmlFor="useCustomSpeed" style={{ fontSize: '14px' }}>
                  <Gauge style={{ width: '16px', height: '16px' }} /> Aangepaste snelheid
                </label>
              </div>
              {useCustomSpeed && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Snelheid (knopen)
                  </label>
                  <input
                    type="number"
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(e.target.value)}
                    min="5"
                    max="30"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="useCustomFuel"
                  checked={useCustomFuel}
                  onChange={(e) => setUseCustomFuel(e.target.checked)}
                />
                <label htmlFor="useCustomFuel" style={{ fontSize: '14px' }}>
                  <Fuel style={{ width: '16px', height: '16px' }} /> Aangepast brandstofverbruik
                </label>
              </div>
              {useCustomFuel && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Brandstof (ton/dag)
                  </label>
                  <input
                    type="number"
                    value={fuelConsumptionPerDay}
                    onChange={(e) => setFuelConsumptionPerDay(e.target.value)}
                    min="5"
                    max="40"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={calculateRoute}
                  disabled={!fromPort.trim() || !toPort.trim() || loading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    opacity: (!fromPort.trim() || !toPort.trim() || loading) ? 0.6 : 1
                  }}
                >
                  {loading ? 'AI Route Berekenen...' : 'Bereken Maritieme Route'}
                </button>
                <button onClick={clearForm}>
                  <Trash2 style={{ width: '16px', height: '16px', color: '#64748b' }} />
                </button>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#0369a1', margin: 0 }}>
                  <strong>Tip:</strong> De kaart toont altijd een <u>zee-route</u> als stippellijn, nooit over land.
                </p>
              </div>
            </div>
          </div>

          <div>
            {results && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #f1f5f9',
                marginBottom: '24px'
              }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                  <Waves style={{ width: '20px', height: '20px' }} />
                  Maritieme Route Analyse
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#1e40af' }}>Route Type</p>
                    <p style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{results.routeType}</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#92400e' }}>Via Kanalen?</p>
                    <p style={{ fontWeight: 'bold', color: '#92400e' }}>
                        {viaKiel ? 'Kiel ' : ''}{viaCorinth ? 'Corinth ' : ''}
                        {!viaKiel && !viaCorinth ? 'Nee' : ''}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#1e40af' }}>Zeeafstand</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>{results.distance.toLocaleString()} zeemijlen</p>
                    <p style={{ fontSize: '12px', color: '#1e40af' }}>via zee (offshore)</p>
                  </div>
                  <div style={{ padding: '12px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
                    <p style={{ fontSize: '14px', color: '#3730a3' }}>Reistijd</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#3730a3' }}>{results.timeDays} dagen</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("map")}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                    marginTop: '16px'
                  }}
                >
                  <MapIcon style={{ width: '16px', height: '16px' }} />
                  Bekijk Zee-route op Kaart (stippellijn)
                </button>
              </div>
            )}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #f1f5f9'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                🌊 Maritieme Zee-route
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                De berekende route volgt <strong>echte zeevaartroutes</strong> en wordt op de kaart weergegeven als een <strong>stippellijn over zee</strong>, nooit over land.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "map" && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            <MapIcon style={{ width: '20px', height: '20px' }} />
            Maritieme Zee-route Kaart
          </h2>
          {results?.waypoints && results.waypoints.length > 0 ? (
            <div>
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                <p style={{ color: '#0369a1', fontSize: '14px' }}>
                  <strong>Route:</strong> {results.fromName} → {results.toName}
                </p>
                {results && (
                  <p style={{ color: '#0369a1', fontSize: '14px' }}>
                    <strong>Zeeafstand:</strong> {results.distance} zeemijlen
                  </p>
                )}
              </div>
              <div id="route-map" style={{ height: '500px', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button onClick={() => setActiveTab("calculator")}>Terug naar Calculator</button>
                {results && (
                  <button onClick={() => {
                    if (mapRef.current) mapRef.current.remove()
                    loadLeafletMaritime()
                  }}>Herlaad Kaart</button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <MapIcon style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Geen Zee-route Beschikbaar</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Bereken eerst een route in de calculator.
              </p>
              <button onClick={() => setActiveTab("calculator")}>Naar Calculator</button>
            </div>
          )}
        </div>
      )}

      {(activeTab === "search" || activeTab === "atlas") && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {activeTab === "search" ? "🔍" : "🌍"}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            {activeTab === "search" ? "Haven Zoeken" : "Haven Atlas"}
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Deze functionaliteit komt binnenkort beschikbaar.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .info.legend {
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}
