
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { storageService } from '../services/storageService';

interface BunkerPrice {
  port: string
  country: string
  code: string
  vlsfo: number
  mgo: number
  ifo380: number
  lng: number | null
  lastUpdated: string
  change24h: {
    vlsfo: number
    mgo: number
    ifo380: number
    lng: number
  }
}

interface ApiResponse {
  success: boolean
  data: BunkerPrice[]
  source: string
  timestamp: string
  message?: string
}

interface HistoricalData {
  date: string
  fullDate: string
  VLSFO: number
  MGO: number
  IFO380: number
  LNG: number | null
}

interface PriceEntry {
  id?: string
  vlsfo: number
  mgo: number
  ifo380: number
  lng: number | null
  date: string
  createdAt?: string
}

const BunkerPricesPage: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [activeChart, setActiveChart] = useState('VLSFO')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [formData, setFormData] = useState({
    vlsfo: '',
    mgo: '',
    ifo380: '',
    lng: '',
    change_vlsfo: '',
    change_mgo: '',
    change_ifo380: '',
    change_lng: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [editFormData, setEditFormData] = useState<PriceEntry | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPrices()
    fetchHistoricalData()
    fetchPriceEntries()
    
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchPrices, 60000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  async function fetchPrices() {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 200));
      // FIX: await getBunkerEntries call
      const entries = await storageService.getBunkerEntries();
      
      const latest = entries[0] || { vlsfo: 0, mgo: 0, ifo380: 0, lng: 0, date: new Date().toISOString() };
      const previous = entries[1] || latest;

      const mockResponse: ApiResponse = {
        success: true,
        source: 'Local Database',
        timestamp: new Date().toISOString(),
        data: [{
            port: 'Rotterdam',
            country: 'Netherlands',
            code: 'RTM',
            vlsfo: latest.vlsfo,
            mgo: latest.mgo,
            ifo380: latest.ifo380,
            lng: latest.lng,
            lastUpdated: latest.date,
            change24h: {
                vlsfo: latest.vlsfo - previous.vlsfo,
                mgo: latest.mgo - previous.mgo,
                ifo380: latest.ifo380 - previous.ifo380,
                lng: (latest.lng || 0) - (previous.lng || 0)
            }
        }]
      };
      setData(mockResponse)
    } catch (err) {
      console.error('Fout bij het ophalen van bunkerprijzen:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchHistoricalData() {
    setHistoryLoading(true)
    try {
        // FIX: await getBunkerEntries call
        const entries = await storageService.getBunkerEntries();
        const sorted = [...entries].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const history: HistoricalData[] = sorted.map((e: any) => ({
            date: new Date(e.date).toLocaleDateString('nl-NL', {day: 'numeric', month:'short'}),
            fullDate: e.date,
            VLSFO: e.vlsfo,
            MGO: e.mgo,
            IFO380: e.ifo380,
            LNG: e.lng
        }));
        setHistoricalData(history);
    } catch (err) {
      console.error('Fout bij het ophalen van historische bunkerprijzen:', err)
    } finally {
      setHistoryLoading(false)
    }
  }

  async function fetchPriceEntries() {
    setEntriesLoading(true)
    try {
      // FIX: await getBunkerEntries call
      const entries = await storageService.getBunkerEntries();
      setPriceEntries(entries);
    } catch (err) {
      console.error('Fout bij het ophalen van prijsinvoeren:', err)
      setPriceEntries([])
    } finally {
      setEntriesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      await storageService.saveBunkerEntry({
          vlsfo: parseFloat(formData.vlsfo),
          mgo: parseFloat(formData.mgo),
          ifo380: parseFloat(formData.ifo380),
          lng: formData.lng ? parseFloat(formData.lng) : null,
          date: formData.date
      });

      setMessage('✅ Bunkerprijzen succesvol opgeslagen!')
      setFormData({
          vlsfo: '',
          mgo: '',
          ifo380: '',
          lng: '',
          change_vlsfo: '',
          change_mgo: '',
          change_ifo380: '',
          change_lng: '',
          date: new Date().toISOString().split('T')[0]
      })
      setShowForm(false)
      
      await fetchPrices();
      await fetchHistoricalData();
      await fetchPriceEntries();
      
    } catch (error) {
      setMessage('❌ Er is een fout opgetreden bij het opslaan')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData) return

    setIsLoading(true)
    setMessage('')

    try {
      await storageService.saveBunkerEntry(editFormData);

      setMessage('✅ Bunkerprijzen succesvol bijgewerkt!')
      setEditFormData(null)
      setShowEditForm(false)
      
      await fetchPrices();
      await fetchHistoricalData();
      await fetchPriceEntries();
    } catch (error) {
      setMessage('❌ Er is een fout opgetreden bij het bijwerken')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Weet u zeker dat u deze prijsinvoer wilt verwijderen?')) {
      return
    }

    try {
      await storageService.deleteBunkerEntry(id);
      setMessage('✅ Prijsinvoer succesvol verwijderd!')
      
      await fetchPrices();
      await fetchHistoricalData();
      await fetchPriceEntries();
    } catch (error) {
      setMessage('❌ Er is een fout opgetreden bij het verwijderen')
      console.error('Error:', error)
    }
  }

  const handleEditClick = (entry: PriceEntry) => {
    setEditFormData(entry);
    setShowEditForm(true);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editFormData) return

    setEditFormData({
      ...editFormData,
      // @ts-ignore
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    })
  }

  const getFilteredHistoricalData = () => {
    const now = new Date()
    let cutoffDate = new Date()

    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return historicalData.filter(item => {
      const itemDate = new Date(item.fullDate)
      return itemDate >= cutoffDate
    })
  }

  const filteredHistoricalData = getFilteredHistoricalData()

  const getYAxisDomain = () => {
    if (filteredHistoricalData.length === 0) return [0, 100]
    
    const values = filteredHistoricalData
      .map(item => item[activeChart as keyof HistoricalData])
      .filter(value => typeof value === 'number') as number[]
    
    if (values.length === 0) return [0, 100]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1
    
    return [Math.max(0, min - padding), max + padding]
  }

  const formatXAxis = (date: string) => {
    if (date.length < 10) return date;
    const dateObj = new Date(date)
    switch (timeRange) {
      case 'week':
        return dateObj.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric' })
      case 'month':
        return dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
      case 'year':
        return dateObj.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
      default:
        return date
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>
            {label}
          </p>
          <p style={{ margin: '4px 0', color: chartColors[activeChart as keyof typeof chartColors] }}>
            {activeChart}: <strong>${payload[0].value.toFixed(2)}</strong>
          </p>
        </div>
      )
    }
    return null
  }

  const rotterdam = data?.data?.[0]

  const chartColors = {
    VLSFO: '#2563eb',
    MGO: '#16a34a', 
    IFO380: '#ea580c',
    LNG: '#9333ea'
  }

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{ height: '32px', backgroundColor: '#e5e7eb', borderRadius: '8px', width: '25%', marginBottom: '16px' }}></div>
          <div style={{ height: '256px', backgroundColor: '#e5e7eb', borderRadius: '8px' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>⛽</span>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Live Bunkerprijzen</h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                  <span style={{ color: '#6b7280' }}>Local Market Data</span>
                </div>
                <span style={{ padding: '2px 8px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                  LIVE
                </span>
                <span style={{ color: '#9ca3af' }}>
                  {new Date(data?.timestamp || '').toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                Live marktprijzen gebaseerd op actuele bunkerdata
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {onClose && (
                <button
                    onClick={onClose}
                    style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: '#374151',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                    }}
                >
                    ⬅️ Sluiten
                </button>
              )}

              <button
                onClick={() => setShowForm(!showForm)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: showForm ? '#dc2626' : '#059669',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {showForm ? '❌ Annuleren' : '💰 Prijzen Invoeren'}
              </button>

              <button
                onClick={() => { fetchPrices(); fetchHistoricalData(); fetchPriceEntries(); }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                🔄 Ververs
              </button>

              <a
                href="https://www.bunkerindex.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                🌐 BunkerIndex
              </a>

            </div>
          </div>
        </div>

        {showForm && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px', 
            marginBottom: '24px',
            border: '2px solid #059669'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              Bunkerprijzen Invoeren
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Datum:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>VLSFO Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="vlsfo"
                  value={formData.vlsfo}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>MGO Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="mgo"
                  value={formData.mgo}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>IFO 380 Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="ifo380"
                  value={formData.ifo380}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>LNG Prijs ($/ton) - optioneel:</label>
                <input
                  type="number"
                  step="0.01"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: isLoading ? '#9ca3af' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Opslaan...' : '💰 Prijzen Opslaan'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Annuleren
                </button>
              </div>
            </form>

            {message && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}`,
                borderRadius: '6px',
                color: message.includes('✅') ? '#065f46' : '#991b1b'
              }}>
                {message}
              </div>
            )}
          </div>
        )}

        {showEditForm && editFormData && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px', 
            marginBottom: '24px',
            border: '2px solid #2563eb'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              Prijzen Bewerken
            </h2>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Datum:</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>VLSFO Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="vlsfo"
                  value={editFormData.vlsfo}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>MGO Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="mgo"
                  value={editFormData.mgo}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>IFO 380 Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="ifo380"
                  value={editFormData.ifo380}
                  onChange={handleEditChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>LNG Prijs ($/ton):</label>
                <input
                  type="number"
                  step="0.01"
                  name="lng"
                  value={editFormData.lng || ''}
                  onChange={handleEditChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Bijwerken...' : '💾 Wijzigingen Opslaan'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditFormData(null)
                  }}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Annuleren
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {rotterdam && <PriceCard 
            title="VLSFO" 
            subtitle="Very Low Sulfur Fuel Oil"
            price={rotterdam.vlsfo} 
            change={rotterdam.change24h.vlsfo} 
            colors={{ bg: '#dbeafe', border: '#93c5fd', main: '#1e40af', dark: '#1e3a8a', accent: '#2563eb' }}
          />}
          {rotterdam && <PriceCard 
            title="MGO" 
            subtitle="Marine Gas Oil"
            price={rotterdam.mgo} 
            change={rotterdam.change24h.mgo} 
            colors={{ bg: '#dcfce7', border: '#86efac', main: '#15803d', dark: '#14532d', accent: '#16a34a' }}
          />}
          {rotterdam && <PriceCard 
            title="IFO 380" 
            subtitle="Intermediate Fuel Oil"
            price={rotterdam.ifo380} 
            change={rotterdam.change24h.ifo380} 
            colors={{ bg: '#fed7aa', border: '#fb923c', main: '#c2410c', dark: '#7c2d12', accent: '#ea580c' }}
          />}
          {rotterdam && <PriceCard 
            title="LNG" 
            subtitle="Liquefied Natural Gas"
            price={rotterdam.lng} 
            change={rotterdam.change24h.lng} 
            colors={{ bg: '#e9d5ff', border: '#c084fc', main: '#7e22ce', dark: '#581c87', accent: '#9333ea' }}
          />}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Prijsontwikkeling Rotterdam
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {['week', 'month', 'year'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as 'week' | 'month' | 'year')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: timeRange === range ? '#2563eb' : '#f3f4f6',
                      color: timeRange === range ? 'white' : '#374151',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize'
                    }}
                  >
                    {range === 'week' ? 'Week' : range === 'month' ? 'Maand' : 'Jaar'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['VLSFO', 'MGO', 'IFO380', 'LNG'].map(fuelType => (
                  <button
                    key={fuelType}
                    onClick={() => setActiveChart(fuelType)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: activeChart === fuelType ? chartColors[fuelType as keyof typeof chartColors] : '#f3f4f6',
                      color: activeChart === fuelType ? 'white' : '#374151',
                      transition: 'all 0.2s'
                    }}
                  >
                    {fuelType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!historyLoading && filteredHistoricalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredHistoricalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} interval="preserveStartEnd" tickFormatter={formatXAxis} />
                <YAxis domain={getYAxisDomain()} tickFormatter={(value) => `$${value}`} width={80} />
                <Tooltip content={<CustomTooltip activeChart={activeChart} chartColors={chartColors} />} />
                <Legend />
                <Line type="monotone" dataKey={activeChart} stroke={chartColors[activeChart as keyof typeof chartColors]} strokeWidth={3} dot={{ fill: chartColors[activeChart as keyof typeof chartColors], strokeWidth: 2, r: 4 }} activeDot={{ r: 8, stroke: chartColors[activeChart as keyof typeof chartColors], strokeWidth: 2 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '48px' }}>📊</div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>{historyLoading ? 'Gegevens laden...' : 'Nog geen historische data'}</h3>
                {!historyLoading && <p style={{ color: '#6b7280' }}>Voer bunkerprijzen in om de prijsontwikkeling in de grafiek te zien</p>}
              </div>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Prijsinvoeren Overzicht
            </h2>
            <button
              onClick={fetchPriceEntries}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🔄 Ververs
            </button>
          </div>

          {entriesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div>Laden...</div></div>
          ) : priceEntries.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Datum</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>VLSFO</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>MGO</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>IFO380</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>LNG</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {priceEntries.map((entry) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#374151' }}>{new Date(entry.date).toLocaleDateString('nl-NL')}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#374151' }}>${entry.vlsfo.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#374151' }}>${entry.mgo.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#374151' }}>${entry.ifo380.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#374151' }}>{entry.lng ? `$${entry.lng.toFixed(2)}` : '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEditClick(entry)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            Bewerk
                          </button>
                          <button
                            onClick={() => entry.id && handleDeleteEntry(entry.id)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            Verwijder
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nog geen prijsinvoeren gevonden.</div>
          )}
        </div>
      </div>
    </div>
  )
}

const PriceCard: React.FC<PriceCardProps> = ({ title, subtitle, price, change, colors }) => {
    if (price === null) {
        return (
            <div style={{ background: `linear-gradient(to bottom right, ${colors.bg}, ${colors.border})`, borderRadius: '8px', padding: '20px', border: `1px solid ${colors.border}`, opacity: 0.6 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.main, marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '12px', color: colors.accent, marginBottom: '12px' }}>{subtitle}</div>
                <div style={{ fontSize: '30px', fontWeight: 'bold', color: colors.dark }}>N/A</div>
            </div>
        );
    }
    const changeColor = change >= 0 ? '#059669' : '#dc2626';
    return (
        <div style={{ background: `linear-gradient(to bottom right, ${colors.bg}, ${colors.border})`, borderRadius: '8px', padding: '20px', border: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: colors.main, marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: colors.accent, marginBottom: '12px' }}>{subtitle}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '30px', fontWeight: 'bold', color: colors.dark }}>${price.toFixed(0)}</span>
                <span style={{ fontSize: '14px', color: colors.accent }}>/MT</span>
            </div>
            <div style={{ fontSize: '12px', marginTop: '8px', color: changeColor, fontWeight: 'bold' }}>
                {change >= 0 ? '↗' : '↘'} {Math.abs(change).toFixed(2)} (24u)
            </div>
        </div>
    );
}

interface PriceCardProps {
    title: string;
    subtitle: string;
    price: number | null;
    change: number;
    colors: { bg: string; border: string; main: string; dark: string; accent: string };
}

export default BunkerPricesPage;
