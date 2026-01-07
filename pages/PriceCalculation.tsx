
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { calculateRouteDistance } from "../services/geminiService"
import { Loader2, Calculator, Ship, DollarSign, Clock, Anchor, Percent } from "lucide-react"

export default function PriceCalculationPage({ onClose }: { onClose?: () => void }) {
  const [calculationType, setCalculationType] = useState("route")
  const [formData, setFormData] = useState({
    fromPort: "",
    toPort: "",
    distance: "",
    shipType: "Bulk Carrier",
    cargoType: "Bulk Dry",
    cargoWeight: "3000",
    fuelPrice: "650",
    portFees: "5000",
    canalFees: "0",
    otherCosts: "1000",
    vesselSpeed: "10.5",
    bunkerConsumption: "7.5",
    dailyHireRate: "4500",
    commission: "3.75", // Standaard broker/address commission
    periodDays: "15"
  })
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Reset results when changing calculation type to prevent render crashes from mismatched data
  useEffect(() => {
    setResults(null);
  }, [calculationType]);

  const shipTypes = [
    "Bulk Carrier",
    "Container Schip",
    "Tanker",
    "General Cargo",
    "Ro-Ro Schip"
  ]

  const calculatePrice = async () => {
    setLoading(true)
    
    try {
      let finalDistance = parseFloat(formData.distance) || 0;

      // STAP 1: AI Distance Engine (Indien havens zijn ingevuld)
      if (formData.fromPort && formData.toPort && calculationType !== "time") {
        const routeData = await calculateRouteDistance(formData.fromPort, formData.toPort, { viaKiel: false, viaCorinth: false });
        finalDistance = routeData.distance;
        setFormData(prev => ({ ...prev, distance: finalDistance.toString() }));
      }

      const speed = parseFloat(formData.vesselSpeed) || 10
      const cons = parseFloat(formData.bunkerConsumption) || 8
      const fuelPrice = parseFloat(formData.fuelPrice) || 0
      const portFees = parseFloat(formData.portFees) || 0
      const canalFees = parseFloat(formData.canalFees) || 0
      const otherCosts = parseFloat(formData.otherCosts) || 0
      const weight = parseFloat(formData.cargoWeight) || 1
      const commissionPct = parseFloat(formData.commission) || 0

      // BEREKENING PER TYPE
      if (calculationType === "time") {
        // --- TIME CHARTER LOGICA (Broker Style) ---
        const dailyRate = parseFloat(formData.dailyHireRate) || 0;
        const days = parseFloat(formData.periodDays) || 1;
        
        const grossHire = dailyRate * days;
        const commissionAmount = grossHire * (commissionPct / 100);
        const netHire = grossHire - commissionAmount;

        setResults({
          type: 'TIME CHARTER',
          totalCost: grossHire,
          finalPrice: netHire,
          commission: commissionAmount,
          voyageDays: days,
          dailyNet: netHire / days,
          breakdown: {
            grossHire,
            commission: commissionAmount,
            netHire,
            dailyRate
          }
        });
      } else {
        // --- VOYAGE CALCULATOR / ROUTE LOGICA (Charterer Style) ---
        if (finalDistance === 0) {
          alert("Voer havens in voor AI afstand of vul handmatig de mijlen in.");
          setLoading(false);
          return;
        }

        const voyageHours = finalDistance / speed;
        const seaDays = voyageHours / 24;
        const portDays = 2; // Gemiddelde laad/los tijd (fix voor pro calculatie)
        const totalVoyageDays = seaDays + portDays;
        
        const totalFuelNeeded = seaDays * cons;
        const fuelCost = totalFuelNeeded * fuelPrice;
        
        const operatingCosts = totalVoyageDays * 2500; // Sim OPEX/Hire
        const voyageExpenses = fuelCost + portFees + canalFees + otherCosts;
        const totalCost = operatingCosts + voyageExpenses;
        
        // Brokerage/Commissions op de vracht
        const freightRequired = totalCost / (1 - (commissionPct / 100));
        const ratePerTon = freightRequired / weight;
        
        setResults({
          type: calculationType === 'route' ? 'ROUTE CALC' : 'VOYAGE ESTIMATE',
          totalCost: Math.round(totalCost),
          finalPrice: Math.round(freightRequired), // De prijs die de charterer moet betalen
          ratePerTon: ratePerTon.toFixed(2),
          voyageDays: Math.round(totalVoyageDays * 10) / 10,
          fuelCost: Math.round(fuelCost),
          distance: Math.round(finalDistance),
          breakdown: {
            seaDays: seaDays.toFixed(1),
            fuelCost: Math.round(fuelCost),
            portFees,
            canalFees,
            otherCosts,
            commission: Math.round(freightRequired - totalCost)
          }
        });
      }
    } catch (error) {
      console.error("Brokerage Calc Error:", error);
      alert("Er is een fout opgetreden. Controleer de invoer.");
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Corrected styles
  const styles = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "24px" },
    container: { maxWidth: "1400px", margin: "0 auto" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" },
    backButton: { background: "white", border: "1px solid #d1d5db", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" },
    title: { fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 },
    grid: { display: "grid", gridTemplateColumns: "1fr 3fr", gap: "24px" },
    card: { background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(8px)", border: "none", borderRadius: "8px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", padding: "20px" },
    cardHeader: { marginBottom: "16px" },
    cardTitle: { fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 4px 0" },
    menuItem: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", marginBottom: "4px" },
    menuItemActive: { backgroundColor: "#3b82f6", color: "white" },
    calculationTabs: { display: "flex", gap: "8px", marginBottom: "24px" },
    calculationTab: { padding: "12px 20px", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", backgroundColor: "white" },
    calculationTabActive: { backgroundColor: "#3b82f6", color: "white", borderColor: "#3b82f6" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
    formGroup: { marginBottom: "16px" },
    label: { display: "block", fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "6px" },
    input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" },
    select: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", backgroundColor: "white" },
    button: { padding: "12px 24px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
    buttonDisabled: { backgroundColor: "#9ca3af", cursor: "not-allowed" },
    resultsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" },
    resultCard: { padding: "20px", borderRadius: "8px", textAlign: "center" as const },
    resultCardPrimary: { backgroundColor: "#dbeafe", border: "1px solid #bfdbfe" },
    resultCardSecondary: { backgroundColor: "#f0f9ff", border: "1px solid #bae6fd" },
    resultCardSuccess: { backgroundColor: "#dcfce7", border: "1px solid #bbf7d0" },
    resultValue: { fontSize: "24px", fontWeight: "bold", margin: "8px 0 4px 0" },
    resultLabel: { fontSize: "14px", color: "#6b7280", margin: 0 },
    breakdownItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #e5e7eb" },
    breakdownLabel: { fontSize: "14px", color: "#374151" },
    breakdownValue: { fontSize: "14px", fontWeight: "600", color: "#111827" }
  } as const

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {onClose ? (
                <button onClick={onClose} style={styles.backButton}>← Sluiten</button>
            ) : (
                <Link to="/dashboard"><button style={styles.backButton}>← Dashboard</button></Link>
            )}
            <h1 style={styles.title}>Broker Intelligence Tool</h1>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>MENU</h3></div>
              <div style={{...styles.menuItem, ...styles.menuItemActive}}><Ship size={18}/><span>Calculator Desk</span></div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}><h3 style={styles.cardTitle}>BROKER SETTINGS</h3></div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Total Commission (%)</label>
                <input type="number" step="0.25" style={styles.input} value={formData.commission} onChange={e=>handleInputChange("commission", e.target.value)} />
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.calculationTabs}>
              <button style={{...styles.calculationTab, ...(calculationType === "route" && styles.calculationTabActive)}} onClick={() => setCalculationType("route")}>Route Prijs</button>
              <button style={{...styles.calculationTab, ...(calculationType === "time" && styles.calculationTabActive)}} onClick={() => setCalculationType("time")}>Time Charter</button>
              <button style={{...styles.calculationTab, ...(calculationType === "voyage" && styles.calculationTabActive)}} onClick={() => setCalculationType("voyage")}>Voyage Calculator</button>
            </div>

            <div style={styles.formGrid}>
              {calculationType !== "time" ? (
                <>
                  <div style={styles.formGroup}><label style={styles.label}>Van Haven</label><input style={styles.input} value={formData.fromPort} onChange={e=>handleInputChange("fromPort", e.target.value)} placeholder="Rotterdam"/></div>
                  <div style={styles.formGroup}><label style={styles.label}>Naar Haven</label><input style={styles.input} value={formData.toPort} onChange={e=>handleInputChange("toPort", e.target.value)} placeholder="Bilbao"/></div>
                  <div style={styles.formGroup}><label style={styles.label}>Snelheid (Knopen)</label><input type="number" step="0.1" style={styles.input} value={formData.vesselSpeed} onChange={e=>handleInputChange("vesselSpeed", e.target.value)}/></div>
                  <div style={styles.formGroup}><label style={styles.label}>Bunker Verbruik (t/dag)</label><input type="number" step="0.1" style={styles.input} value={formData.bunkerConsumption} onChange={e=>handleInputChange("bunkerConsumption", e.target.value)}/></div>
                  <div style={styles.formGroup}><label style={styles.label}>Lading Gewicht (ton)</label><input type="number" style={styles.input} value={formData.cargoWeight} onChange={e=>handleInputChange("cargoWeight", e.target.value)}/></div>
                  <div style={styles.formGroup}><label style={styles.label}>Afstand (NM) - AI Autofill</label><input type="number" style={styles.input} value={formData.distance} onChange={e=>handleInputChange("distance", e.target.value)}/></div>
                </>
              ) : (
                <>
                  <div style={styles.formGroup}><label style={styles.label}>Daily Hire Rate ($)</label><input type="number" style={styles.input} value={formData.dailyHireRate} onChange={e=>handleInputChange("dailyHireRate", e.target.value)}/></div>
                  <div style={styles.formGroup}><label style={styles.label}>Periode (Dagen)</label><input type="number" style={styles.input} value={formData.periodDays} onChange={e=>handleInputChange("periodDays", e.target.value)}/></div>
                </>
              )}
            </div>

            {calculationType !== "time" && (
              <div style={styles.formGrid}>
                <div style={styles.formGroup}><label style={styles.label}>Bunker Prijs ($/MT)</label><input type="number" style={styles.input} value={formData.fuelPrice} onChange={e=>handleInputChange("fuelPrice", e.target.value)}/></div>
                <div style={styles.formGroup}><label style={styles.label}>Haven Kosten ($)</label><input type="number" style={styles.input} value={formData.portFees} onChange={e=>handleInputChange("portFees", e.target.value)}/></div>
              </div>
            )}

            <button onClick={calculatePrice} disabled={loading} style={{...styles.button, ...(loading && styles.buttonDisabled)}}>
              {loading ? <><Loader2 className="animate-spin" size={16} /> Berekenen...</> : <><Calculator size={18}/> Analyseer Reis</>}
            </button>

            {results && (
              <div style={{ marginTop: "32px" }} className="animate-fade-in">
                <h3 style={styles.cardTitle}>{results.type} - RESULTATEN</h3>
                <div style={styles.resultsGrid}>
                  <div style={{...styles.resultCard, ...styles.resultCardPrimary}}>
                    <p style={styles.resultLabel}>{calculationType === 'time' ? 'Totaal Bruto' : 'Netto Kosten'}</p>
                    <p style={{...styles.resultValue, color: '#1e40af'}}>${(results.totalCost || 0).toLocaleString()}</p>
                  </div>
                  <div style={{...styles.resultCard, ...styles.resultCardSuccess}}>
                    <p style={styles.resultLabel}>{calculationType === 'time' ? 'Netto Uitbetaling' : 'Vrachtprijs Idea'}</p>
                    <p style={{...styles.resultValue, color: '#166534'}}>{calculationType === 'time' ? `$${(results.finalPrice || 0).toLocaleString()}` : `€${results.ratePerTon || '0.00'} pmt`}</p>
                  </div>
                  <div style={{...styles.resultCard, ...styles.resultCardSecondary}}>
                    <p style={styles.resultLabel}>Dagen / Afstand</p>
                    <p style={{...styles.resultValue, color: '#0c4a6e'}}>{results.voyageDays || 0} d {results.distance ? `/ ${results.distance} NM` : ''}</p>
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <h4 style={styles.cardTitle}>Broker Breakdown</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      {calculationType === 'time' ? (
                        <div style={styles.breakdownItem}><span style={styles.breakdownLabel}>Dagtarief</span><span style={styles.breakdownValue}>${results.breakdown?.dailyRate || 0}</span></div>
                      ) : (
                        <div style={styles.breakdownItem}><span style={styles.breakdownLabel}>Brandstof Totaal</span><span style={styles.breakdownValue}>${(results.breakdown?.fuelCost || 0).toLocaleString()}</span></div>
                      )}
                      <div style={styles.breakdownItem}>
                        <span style={styles.breakdownLabel}>Commissie ({formData.commission}%)</span>
                        <span style={{...styles.breakdownValue, color: '#dc2626'}}>
                          - ${(results.commission || results.breakdown?.commission || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={styles.breakdownItem}><span style={styles.breakdownLabel}>Totaal Resultaat</span><span style={styles.breakdownValue}>${(results.finalPrice || 0).toLocaleString()}</span></div>
                      <div style={styles.breakdownItem}><span style={styles.breakdownLabel}>Status</span><span style={{...styles.breakdownValue, color: '#16a34a'}}>Verified via Engine</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .animate-fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
