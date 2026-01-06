
import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FileText, Edit3, Eye, Plus, Trash2, CheckCircle, Download, Save, ArrowRight, Printer } from "lucide-react"

interface Contract {
  id: string
  type: string
  vesselName: string
  cargoDescription: string
  charterer: string
  owner: string
  status: "draft" | "pending" | "signed" | "expired"
  createdDate: string
  laycanStart: string
  laycanEnd: string
  loadingPort: string
  dischargingPort: string
  freight: number
  currency: string
  data: any
  riderClauses?: string[]
}

interface ContractData {
  contractType: string
  vesselName: string
  vesselType: string
  dwt: string
  charterer: string
  owner: string
  cargoType: string
  quantity: string
  loadingPort: string
  dischargingPort: string
  laycanStart: string
  laycanEnd: string
  freight: string
  currency: string
  demurrage: string
  dispatch: string
  specialTerms: string
  riderClauses?: string[]
}

const contractTemplates = {
  "voyage-charter": {
    name: "Voyage Charter Party",
    description: "BIMCO GENCON 94 - Standard voyage charter",
    fields: ["vessel", "cargo", "quantity", "loadingPort", "dischargingPort", "freight", "laycan", "demurrage"],
  },
  "time-charter": {
    name: "Time Charter Party",
    description: "BIMCO BALTIME 1939 - Time charter agreement",
    fields: ["vessel", "period", "hire", "delivery", "redelivery", "bunkers", "insurance"],
  },
  coa: {
    name: "Contract of Affreightment",
    description: "BIMCO COA - Multiple voyage agreement",
    fields: ["cargo", "quantity", "shipments", "period", "freight", "ports", "specifications"],
  },
};

export default function ContractsPage({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "1",
      type: "voyage-charter",
      vesselName: "MV Atlantic Star",
      cargoDescription: "Iron Ore, 75,000 MT",
      charterer: "Global Mining Corp",
      owner: "Nordic Shipping AS",
      status: "signed",
      createdDate: "2025-01-05",
      laycanStart: "2025-02-01",
      laycanEnd: "2025-02-05",
      loadingPort: "Port Hedland",
      dischargingPort: "Rotterdam",
      freight: 28.5,
      currency: "USD",
      data: {},
    },
    {
      id: "2",
      type: "time-charter",
      vesselName: "MV Pacific Dawn",
      cargoDescription: "Container Service",
      charterer: "Maritime Logistics Ltd",
      owner: "Ocean Carriers Inc",
      status: "pending",
      createdDate: "2025-01-07",
      laycanStart: "2025-02-15",
      laycanEnd: "2025-08-15",
      loadingPort: "Various",
      dischargingPort: "Various",
      freight: 18500,
      currency: "USD",
      data: {},
    },
  ])

  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [showGenerator, setShowGenerator] = useState(false)
  const [activeTab, setActiveTab] = useState("contracts")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return { backgroundColor: "#dcfce7", color: "#166534" }
      case "pending":
        return { backgroundColor: "#fef9c3", color: "#854d0e" }
      case "draft":
        return { backgroundColor: "#f3f4f6", color: "#374151" }
      case "expired":
        return { backgroundColor: "#fee2e2", color: "#991b1b" }
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" }
    }
  }

  const handleContractFinalized = (contractData: ContractData) => {
    const newContract: Contract = {
        id: Date.now().toString(),
        type: contractData.contractType,
        vesselName: contractData.vesselName,
        cargoDescription: `${contractData.cargoType}, ${contractData.quantity} MT`,
        charterer: contractData.charterer,
        owner: contractData.owner || user?.company || "Your Company",
        status: "pending", // Goes to pending after editing
        createdDate: new Date().toISOString().split("T")[0],
        laycanStart: contractData.laycanStart,
        laycanEnd: contractData.laycanEnd,
        loadingPort: contractData.loadingPort,
        dischargingPort: contractData.dischargingPort,
        freight: Number.parseFloat(contractData.freight) || 0,
        currency: contractData.currency,
        data: contractData,
        riderClauses: contractData.riderClauses
    }

    setContracts((prev) => [newContract, ...prev])
    setShowGenerator(false)
    setActiveTab("contracts")
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Contract Management
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Create, Edit & Fix Charter Parties (BIMCO Standard)
            </p>
          </div>
          {onClose && (
            <button 
                onClick={onClose}
                style={{
                padding: '10px 20px',
                backgroundColor: '#fff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
                }}
            >
                ← Sluiten
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
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
          { id: "contracts", label: "My Contracts" },
          { id: "templates", label: "Templates" },
          { id: "generator", label: "New Contract" },
        ].map((tab) => (
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
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page Content */}
      {activeTab === "contracts" && (
        <div style={{ gap: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Active Fixtures</h2>
            <button 
              onClick={() => {
                  setActiveTab("generator");
                  setShowGenerator(true);
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18}/> New Fixture
            </button>
          </div>

          {/* Contracts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {contracts.map((contract) => (
              <div key={contract.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                    <div style={{
                      backgroundColor: '#dbeafe',
                      borderRadius: '50%',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={24} className="text-blue-600"/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        {contract.vesselName}
                      </h3>
                      <p style={{ color: '#6b7280', marginBottom: '8px' }}>{contract.cargoDescription}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{contract.loadingPort} ➝ {contract.dischargingPort}</span>
                        <span>•</span>
                        <span>{contract.laycanStart} - {contract.laycanEnd}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-800">{contract.freight} {contract.currency}/MT</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...getStatusColor(contract.status)
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{contract.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="flex items-center gap-2 px-3 py-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">
                        <Edit3 size={14}/> Edit
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-white border rounded hover:bg-gray-50 text-sm font-medium">
                        <Printer size={14}/> Print
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold">
                        <CheckCircle size={14}/> Fix
                      </button>
                    </div>

                    <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
                      <div>Chrt: {contract.charterer}</div>
                      <div>Created: {contract.createdDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div style={{ gap: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>BIMCO Contract Templates</h2>
            <p style={{ color: '#6b7280' }}>Select a base template to start editing.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {Object.entries(contractTemplates).map(([key, template]) => (
              <div key={key} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      backgroundColor: '#dbeafe',
                      borderRadius: '50%',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={20} className="text-blue-600"/>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                        {template.name}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>{template.description}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedTemplate(key)
                      setActiveTab("generator")
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "generator" && (
        <ContractGeneratorForm
          onFinalize={handleContractFinalized}
          selectedTemplate={selectedTemplate}
        />
      )}
    </div>
  )
}

// --- LIVE EDITOR COMPONENTS ---

function LiveContractEditor({ data, onBack, onSave }: { data: ContractData, onBack: () => void, onSave: (d: ContractData) => void }) {
    const [riderClauses, setRiderClauses] = useState<string[]>(data.riderClauses || []);
    const [newClause, setNewClause] = useState("");
    const [formData, setFormData] = useState(data);

    const addClause = () => {
        if (newClause.trim()) {
            setRiderClauses([...riderClauses, newClause]);
            setNewClause("");
        }
    };

    const removeClause = (index: number) => {
        setRiderClauses(riderClauses.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave({ ...formData, riderClauses });
    };

    // Simulated Contract Text Generation
    const contractText = `
CHARTER PARTY
CODE NAME: "${formData.contractType.toUpperCase()}"

1. SHIPBROKER: Shortsea Europe Platform
2. PLACE AND DATE: Rotterdam, ${new Date().toLocaleDateString()}

3. OWNERS:
   ${formData.owner}
   
4. CHARTERERS:
   ${formData.charterer}

5. VESSEL:
   ${formData.vesselName} (${formData.vesselType}) - ${formData.dwt} DWT

6. CARGO:
   ${formData.quantity} MT of ${formData.cargoType}
   
7. LOADING PORT(S):
   ${formData.loadingPort}

8. DISCHARGING PORT(S):
   ${formData.dischargingPort}

9. LAYCAN:
   ${formData.laycanStart} to ${formData.laycanEnd}

10. FREIGHT RATE:
    ${formData.currency} ${formData.freight} per metric ton
    
11. DEMURRAGE:
    ${formData.currency} ${formData.demurrage} per day / pro rata

12. SPECIAL TERMS:
    ${formData.specialTerms || 'None'}

--------------------------------------------------
RIDER CLAUSES
--------------------------------------------------
${riderClauses.map((c, i) => `\nClause ${13 + i}: ${c}`).join('\n')}
    `;

    return (
        <div className="flex h-[calc(100vh-200px)] gap-6">
            {/* LEFT: Editor Controls */}
            <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Edit3 size={18}/> Quick Edits</h3>
                    <div className="space-y-3">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Freight Rate</label>
                             <input type="number" className="w-full border p-2 rounded bg-white" value={formData.freight} onChange={e=>setFormData({...formData, freight: e.target.value})} />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Laycan Start</label>
                             <input type="date" className="w-full border p-2 rounded bg-white" value={formData.laycanStart} onChange={e=>setFormData({...formData, laycanStart: e.target.value})} />
                         </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus size={18}/> Rider Clauses</h3>
                    
                    <div className="flex gap-2 mb-4">
                        <input 
                            className="flex-1 border p-2 rounded text-sm" 
                            placeholder="e.g. War Risk Clause..."
                            value={newClause}
                            onChange={e => setNewClause(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addClause()}
                        />
                        <button onClick={addClause} className="bg-slate-900 text-white p-2 rounded hover:bg-slate-700"><Plus size={18}/></button>
                    </div>

                    <div className="space-y-2">
                        {riderClauses.map((clause, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded text-sm flex justify-between items-start border border-gray-100 group">
                                <span>{idx + 13}. {clause}</span>
                                <button onClick={() => removeClause(idx)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        {riderClauses.length === 0 && <p className="text-gray-400 text-xs italic text-center">No rider clauses added.</p>}
                    </div>
                </div>
                
                <div className="mt-auto flex gap-2 pt-4">
                    <button onClick={onBack} className="px-4 py-2 border rounded hover:bg-gray-50">Back</button>
                    <button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 flex items-center justify-center gap-2">
                        <CheckCircle size={18}/> Finalize Contract
                    </button>
                </div>
            </div>

            {/* RIGHT: Live Preview */}
            <div className="flex-1 bg-gray-100 rounded-xl p-8 overflow-y-auto border border-gray-300 shadow-inner font-mono text-sm relative">
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 border flex items-center gap-2">
                    <Eye size={14}/> Live Preview
                </div>
                <pre className="whitespace-pre-wrap font-mono text-slate-800 leading-relaxed">
                    {contractText}
                </pre>
            </div>
        </div>
    );
}

// Contract Generator / Wizard Component
function ContractGeneratorForm({
  onFinalize,
  selectedTemplate,
}: {
  onFinalize: (data: ContractData) => void
  selectedTemplate: string
}) {
  const [step, setStep] = useState<'form' | 'editor'>('form');

  const [formData, setFormData] = useState<ContractData>({
    contractType: selectedTemplate || "voyage-charter",
    vesselName: "",
    vesselType: "",
    dwt: "",
    charterer: "",
    owner: "",
    cargoType: "",
    quantity: "",
    loadingPort: "",
    dischargingPort: "",
    laycanStart: "",
    laycanEnd: "",
    freight: "",
    currency: "USD",
    demurrage: "",
    dispatch: "",
    specialTerms: "",
    riderClauses: []
  })

  const goToEditor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.contractType || !formData.vesselName) {
      alert("Please fill in main details")
      return
    }
    setStep('editor');
  }

  if (step === 'editor') {
      return <LiveContractEditor data={formData} onBack={() => setStep('form')} onSave={onFinalize} />;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Fixture Wizard</h2>
        <p style={{ color: '#6b7280' }}>Step 1: Enter Main Terms</p>
      </div>

      <form onSubmit={goToEditor} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {/* Contract Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Contract Type *
            </label>
            <select
              value={formData.contractType}
              onChange={(e) => setFormData((prev) => ({ ...prev, contractType: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
              required
            >
              <option value="voyage-charter">Voyage Charter Party</option>
              <option value="time-charter">Time Charter Party</option>
              <option value="coa">Contract of Affreightment</option>
            </select>
          </div>

          {/* Vessel Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Vessel Name *
            </label>
            <input
              type="text"
              value={formData.vesselName}
              onChange={(e) => setFormData((prev) => ({ ...prev, vesselName: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              required
            />
          </div>

          {/* Charterer */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Charterer *
            </label>
            <input
              type="text"
              value={formData.charterer}
              onChange={(e) => setFormData((prev) => ({ ...prev, charterer: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              required
            />
          </div>

          {/* Owner */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Owner
            </label>
            <input
              type="text"
              value={formData.owner}
              onChange={(e) => setFormData((prev) => ({ ...prev, owner: e.target.value }))}
              placeholder="Owner Name"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

          {/* Cargo */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Cargo
            </label>
            <input
              type="text"
              value={formData.cargoType}
              onChange={(e) => setFormData((prev) => ({ ...prev, cargoType: e.target.value }))}
              placeholder="e.g. Wheat"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

           {/* Quantity */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Quantity (MT)
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          
           {/* Load Port */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Load Port
            </label>
            <input
              type="text"
              value={formData.loadingPort}
              onChange={(e) => setFormData((prev) => ({ ...prev, loadingPort: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          
           {/* Disch Port */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Disch Port
            </label>
            <input
              type="text"
              value={formData.dischargingPort}
              onChange={(e) => setFormData((prev) => ({ ...prev, dischargingPort: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>

          {/* Freight Rate */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
              Freight Rate
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="0.01"
                value={formData.freight}
                onChange={(e) => setFormData((prev) => ({ ...prev, freight: e.target.value }))}
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                style={{ width: '80px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: 'white' }}
              >
                <option value="USD">USD</option><option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        <button 
            type="submit" 
            style={{
              padding: '14px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Go to Live Editor <ArrowRight size={18}/>
        </button>
      </form>
    </div>
  )
}
