
import { GoogleGenAI, Type } from "@google/genai";
import { CargoRequest, QuoteResult, MarketReport } from "../types";

const PRO_MODEL = "gemini-3-pro-preview"; 
const FLASH_MODEL = "gemini-3-flash-preview";

const getAiClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- STRIKT MARITIEM ROUTE-PROTOCOL (REVISIE 2025.7 - WATER-ONLY) ---
const MARITIME_ROUTING_ENGINE_SPEC = `
  ROLE: Lead Maritime Navigator & Strategic Routing Expert.
  STRICT MANDATE: Landmasses are physical barriers. ZERO tolerance for land-crossing.
  
  WAYPOINT-KETTING PROTOCOL (NON-NEGOTIABLE):
  - Baltische Zee ↔ Noordzee: MOET via Skagen [57.74, 10.59] en De Sont [55.61, 12.71].
  - Noordzee ↔ Atlantisch/Med: MOET via Nauw van Calais [51.10, 1.50], Ushant [48.50, -5.50], en Kaap Finisterre [43.00, -9.50].
  - Entree Middellandse Zee: MOET via Gibraltar [35.95, -5.35].
  
  RIGA-FIX (VEILIGE TOEGANG):
  1. VERPLICHT: Kaap Kolka [57.75, 22.60] ALTIJD passeren voor toegang/exit Golf van Riga.
  2. NOOIT een directe lijn naar Riga trekken die Kurzeme (West-Letland) snijdt.

  CURVE-INTERPOLATIE:
  - Gebruik GEEN lineaire lijnen. Volg de natuurlijke kustlijn met een buffer van 15nm.
  - Genereer minimaal 1 waypoint per 10nm voor een vloeiende weergave.
`;

// --- REINFORCED CHARTERER ADVOCACY PROTOCOL ---
const CHARTERER_ADVISORY_RULES = `
  STRICT MANDATE: You are the CHARTERER'S ADVOCATE. 
  - ALLE adviezen MOETEN in het belang van de Charterer zijn. 
  - Adviseer NOOIT 'BBB' (Before Breaking Bulk) of 'Freight Prepaid'.
  - Focus op het verlagen van de vrachtprijs en het beperken van risico's voor de verlader.
  - EU ETS: Schepen < 5000 GT zijn vrijgesteld. Adviseer charterers om hierop te controleren voor kostenbesparing.
`;

const cleanAndParseJSON = (text: string | undefined) => {
  if (!text) return null;
  let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
  if (!jsonMatch) {
      try { return JSON.parse(cleaned); } catch (e) { return null; }
  }
  try { 
    return JSON.parse(jsonMatch[0]); 
  } catch (e) { 
    console.error("JSON Parse Error:", e);
    return null; 
  }
};

export const getFreightQuote = async (req: CargoRequest, lang: string): Promise<QuoteResult> => {
  const ai = getAiClient();
  const prompt = `
    TASK: Generate Detailed Freight Intelligence for ${req.volume}mt ${req.cargoType} from ${req.loadPort} to ${req.dischargePort}.
    ${MARITIME_ROUTING_ENGINE_SPEC}
    ${CHARTERER_ADVISORY_RULES}

    INSTRUCTIONS:
    - Bereken een realistische vrachtrange (PMT) op basis van actuele marktdata.
    - Genereer een strategisch onderhandelingsplan voor de charterer.
    - Zorg dat de route ononderbroken is en strikt over water gaat.

    REQUIRED JSON FORMAT:
    {
      "currency": "EUR",
      "marketAdvisoryEn": "Tactical advice.",
      "marketAdvisoryNl": "Tactisch advies.",
      "estimatedRateLow": number, "estimatedRateHigh": number,
      "totalFreightLow": number, "totalFreightHigh": number,
      "co2Emission": number, "euEtsCost": number, "etsApplicable": boolean,
      "exemptionReason": "string", "voyageDays": number,
      "marketSentiment": { "status": "CHARTERER_MARKET", "score": number, "supplyIndicator": "string", "vesselSizeContext": "string" },
      "breakdown": { "baseRate": number, "bunkerAdjustment": number, "seasonalPremium": number, "portSurcharge": number },
      "negotiation": { "targetRate": number, "focusPoints": ["Point 1"], "leverageTextEn": "string", "leverageTextNl": "string", "margin": "string", "leverageLevel": "HIGH" },
      "historical": { "lastMatchDate": "string", "lastMatchRate": number, "trend30Days": "string", "seasonalNormDelta": "string" },
      "scenarios": { "bunkerSensitivity": number, "flexibilitySavings": number },
      "routeDetails": {
        "origin": { "lat": number, "lng": number, "name": "${req.loadPort}" },
        "destination": { "lat": number, "lng": number, "name": "${req.dischargePort}" },
        "distanceNm": number,
        "waypoints": [{"lat": number, "lng": number}]
      },
      "skagenAlternative": {
        "rateLow": number, "rateHigh": number, "lumpsumLow": number, "lumpsumHigh": number, "co2": number, "days": number, "distance": number,
        "diffTextEn": "string", "diffTextNl": "string", "waypoints": [{"lat": number, "lng": number}]
      }
    }
  `;

  try {
      const response = await ai.models.generateContent({ 
        model: PRO_MODEL, 
        contents: prompt, 
        config: { tools: [{googleSearch: {}}] } 
      });
      const quote = cleanAndParseJSON(response.text);
      if (quote) {
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            quote.sources = chunks
                .map((c: any) => c.web?.uri)
                .filter((u: string | undefined) => !!u);
        }
      }
      return quote || ({} as any);
  } catch (error) {
      console.error("Routing Failure:", error);
      return { } as any;
  }
};

export const analyzeBrokerQuote = async (
    quoteText: string, 
    report: MarketReport | null, 
    manualRates: any[], 
    fileData?: { data: string, mimeType: string },
    previousAiResult?: string
) => {
  const ai = getAiClient();
  const professionalPrompt = `
    ROLE: Senior Charterer's Advocate & Maritime Risk Auditor.
    ${CHARTERER_ADVISORY_RULES}
    ${MARITIME_ROUTING_ENGINE_SPEC}
    TASK: Conduct a ruthless commercial and risk audit of this broker offer: "${quoteText}". 
    Identify hidden costs, verify if the rate is market-conform, and provide a Battle-Plan for the Charterer.
  `;
  const parts: any[] = [{ text: professionalPrompt }];
  if (fileData) parts.push({ inlineData: fileData });
  try {
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: { parts }, 
      config: { tools: [{googleSearch: {}}] } 
    });
    return response.text || "";
  } catch (error) {
    throw error;
  }
};

export const calculateRouteDistance = async (origin: string, destination: string, options: any) => {
  const ai = getAiClient();
  const prompt = `Calculate sea distance from ${origin} to ${destination}. 
  ${MARITIME_ROUTING_ENGINE_SPEC}
  Return ONLY JSON: {"distance": number, "routeDescription": "string", "waypoints": [{"lat": number, "lng": number}]}.`;
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text);
};

export const generateMarketReport = async (): Promise<MarketReport> => {
  const ai = getAiClient();
  const prompt = `Generate a Shortsea Market Report for Europe. ${CHARTERER_ADVISORY_RULES} 
  Include regional trends, detected fixtures, and primary market drivers. Return as JSON.`;
  try {
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: prompt,
        config: { tools: [{googleSearch: {}}] }
      });
      return cleanAndParseJSON(response.text);
  } catch (error) {
      throw error;
  }
};

export const getIceRestrictions = async (port: string) => {
  return executeStrategicSearch(`LIVE ice status for ${port}. Return JSON: {"restriction": "string", "effectiveDate": "string", "statusColor": "red|yellow|green"}.`);
};

export const estimatePortDisbursements = async (port: string, gt: number) => {
  return executeStrategicSearch(`Port DA for ${gt}GT coaster at ${port}. Return JSON: {"currency": "EUR", "total": number, "breakdown": {"harborDues": number, "pilotage": number, "agency": number}}.`);
};

const executeStrategicSearch = async (prompt: string): Promise<any> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: prompt,
            config: { 
                tools: [{googleSearch: {}}],
                temperature: 0.1 
            }
        });
        return cleanAndParseJSON(response.text);
    } catch (error) {
        console.error("AI Search Failure:", error);
        return null;
    }
};

export const getLiveEUAPrice = async () => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: PRO_MODEL,
            contents: "Find the latest EUA price in EUR. Return JSON: {\"price\": number}",
            config: { tools: [{googleSearch: {}}] }
        });
        const obj = cleanAndParseJSON(response.text);
        return obj?.price || 85.0;
    } catch (e) {
        return 85.0;
    }
};

export const findRealTimeShips = async (region: string, minDwt: number, maxDwt: number) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `Open vessels in ${region} ${minDwt}-${maxDwt} DWT.`,
    config: { tools: [{googleSearch: {}}] }
  });
  return response.text;
};

export const generateDeepDiveAnalysis = async (region: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: `Strategic Independent Market Analysis for the ${region}. ${CHARTERER_ADVISORY_RULES}`,
    config: { tools: [{googleSearch: {}}] }
  });
  return response.text || "";
};

export const getCommodityStowage = async (commodity: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: FLASH_MODEL,
    contents: `Stowage Factor for ${commodity}. Return JSON: {"factorCbft": number, "description": "string"}.`,
    config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text);
};

export const analyzeSofPdf = async (fileData: { data: string, mimeType: string }) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: PRO_MODEL,
    contents: { parts: [{ text: "Extract maritime laytime events from this SOF to JSON." }, { inlineData: fileData }] },
    config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text);
};
