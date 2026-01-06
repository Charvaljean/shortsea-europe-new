

import { GoogleGenAI, Type } from "@google/genai";
import { CargoRequest, QuoteResult, MarketReport } from "../types";

const PRO_MODEL = "gemini-3-pro-preview"; 
const FLASH_MODEL = "gemini-3-flash-preview";

const MARITIME_ROUTING_ENGINE_SPEC = `
  ROLE: Lead Maritime Navigator & Strategic Routing Expert.
  STRICT MANDATE: Landmasses are physical barriers. ZERO tolerance for land-crossing.
  
  WAYPOINT-KETTING PROTOCOL (NON-NEGOTIABLE):
  1. Baltische In-/Uitgang: De Sont [55.61, 12.71] <-> Skagen [57.74, 10.59].
  2. RIGA-FIX: VERPLICHT Kaap Kolka [57.75, 22.60] passeren voor elke route in/uit de Golf van Riga. Nooit over het Kurzeme schiereiland.
  3. Noordzee Corridor: Skagen <-> Nauw van Calais [51.10, 1.50].
  4. UK/Ierland: Forceer via St. George's Channel [52.00, -6.00] en Lands End [50.00, -6.00] indien Ierse Zee route.
  5. Atlantische Bocht: Calais <-> Ushant (Bretagne) [48.50, -5.50].
  6. Iberische Westkust: Ushant <-> Kaap Finisterre [43.00, -9.50] <-> St. Vincent [37.00, -9.00].
  7. Middellandse Zee Entree: St. Vincent <-> Gibraltar [35.95, -5.35].
  8. Spaanse Oostkust: Gibraltar <-> Cabo de Gata [36.65, -2.20] <-> Cabo de la Nao [38.75, 0.25] <-> Barcelona.

  CURVE-INTERPOLATIE: Nooit lineaire lijnen over land. Gebruik een vloeiende curve die de kustlijn volgt op een buffer van minimaal 15nm.
  POLYLINE DENSITEIT: 1 waypoint per 10nm voor vloeiende weergave.
`;

const CHARTERER_ADVISORY_RULES = `
  STRICT MANDATE: You are the CHARTERER'S ADVOCATE. 
  - ALLE adviezen MOETEN in het belang van de Charterer zijn. 
  - Adviseer NOOIT 'BBB' (Before Breaking Bulk).
  - Focus op het verlagen van de vrachtprijs, minimaliseren van bunkersupplementen en beperken van operationele risico's.
  - Gebruik 3-dagen consistentie: identieke aanvragen binnen 72u krijgen exact hetzelfde advies.
`;

const cleanAndParseJSON = (text: string | undefined) => {
  if (!text) return null;
  let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
  if (!jsonMatch) {
      try { return JSON.parse(cleaned); } catch (e) { return null; }
  }
  try { return JSON.parse(jsonMatch[0]); } catch (e) { return null; }
};

export const getFreightQuote = async (req: CargoRequest, lang: string): Promise<QuoteResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate Freight Strategy for ${req.volume}mt ${req.cargoType} from ${req.loadPort} to ${req.dischargePort}. Return JSON.`;
  try {
      const response = await ai.models.generateContent({ 
        model: PRO_MODEL, 
        contents: prompt, 
        config: { 
          systemInstruction: MARITIME_ROUTING_ENGINE_SPEC + "\n" + CHARTERER_ADVISORY_RULES,
          tools: [{googleSearch: {}}],
          responseMimeType: "application/json"
        } 
      });
      return cleanAndParseJSON(response.text) || ({} as any);
  } catch (error) {
      console.error("AI Failure:", error);
      throw error;
  }
};

export const analyzeBrokerQuote = async (
  quoteText: string, 
  report: MarketReport | null, 
  manualRates: any[], 
  fileData?: { data: string, mimeType: string },
  aiDraft?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let context = "";
  if (report) context += `\nMarket Context: ${JSON.stringify(report)}`;
  if (manualRates && manualRates.length > 0) context += `\nRecent Fixtures: ${JSON.stringify(manualRates.slice(0, 10))}`;
  if (aiDraft) context += `\nPrevious AI Quick Scan Draft: ${aiDraft}`;

  const professionalPrompt = `Audit this broker offer: "${quoteText}". ${context} Provide a Strategic Counter-Strategy for the Charterer.`;
  const parts: any[] = [{ text: professionalPrompt }];
  if (fileData) parts.push({ inlineData: fileData });
  try {
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: { parts }, 
      config: { 
        systemInstruction: CHARTERER_ADVISORY_RULES,
        tools: [{googleSearch: {}}] 
      } 
    });
    return response.text || "Analysis failed.";
  } catch (error) { return "AI Analysis temporary unavailable. Please check API Key."; }
};

export const calculateRouteDistance = async (origin: string, destination: string, options: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Calculate nautical distance from ${origin} to ${destination}. JSON format.`;
  try {
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: prompt, 
      config: { 
        systemInstruction: MARITIME_ROUTING_ENGINE_SPEC,
        responseMimeType: "application/json" 
      } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { throw new Error("API Key or Connection Error"); }
};

export const generateMarketReport = async (): Promise<MarketReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate Full Shortsea Market Insight Report for Europe. JSON format.`;
  try {
      const response = await ai.models.generateContent({ 
        model: PRO_MODEL, 
        contents: prompt, 
        config: { 
          systemInstruction: CHARTERER_ADVISORY_RULES,
          tools: [{googleSearch: {}}],
          responseMimeType: "application/json"
        } 
      });
      return cleanAndParseJSON(response.text);
  } catch (error) { throw error; }
};

export const getIceRestrictions = async (port: string) => executeStrategicSearch(`Ice status and restrictions for ${port}. JSON.`);

export const estimatePortDisbursements = async (port: string, gt: number) => executeStrategicSearch(`Estimated DA for ${gt}GT vessel at ${port}. JSON breakdown.`);

const executeStrategicSearch = async (prompt: string): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({ 
          model: PRO_MODEL, 
          contents: prompt, 
          config: { 
            tools: [{googleSearch: {}}], 
            temperature: 0.1,
            responseMimeType: "application/json"
          } 
        });
        return cleanAndParseJSON(response.text);
    } catch (error) { return null; }
};

export const getLiveEUAPrice = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({ 
          model: PRO_MODEL, 
          contents: "Get current EUA Carbon price in EUR. Return JSON: {\"price\": number}", 
          config: { 
            tools: [{googleSearch: {}}],
            responseMimeType: "application/json"
          } 
        });
        return cleanAndParseJSON(response.text)?.price || 85.0;
    } catch (e) { return 85.0; }
};

export const findRealTimeShips = async (region: string, minDwt: number, maxDwt: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({ 
    model: PRO_MODEL, 
    contents: `List open tonnage in ${region} between ${minDwt} and ${maxDwt} DWT.`, 
    config: { tools: [{googleSearch: {}}] } 
  });
  return response.text;
};

export const generateDeepDiveAnalysis = async (region: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: `Detailed Market Deep-Dive for ${region}.`, 
      config: { 
        systemInstruction: CHARTERER_ADVISORY_RULES,
        tools: [{googleSearch: {}}] 
      } 
    });
    return response.text || "";
  } catch(e) { return "Deep dive analysis restricted. Check connectivity."; }
};

export const getCommodityStowage = async (commodity: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: FLASH_MODEL, 
      contents: `Find Stowage Factor (SF) in CBFT/MT for ${commodity}. JSON format.`, 
      config: { responseMimeType: "application/json" } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { return null; }
};

export const analyzeSofPdf = async (fileData: { data: string, mimeType: string }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: PRO_MODEL, 
      contents: { parts: [{ text: "Extract laytime events from this SOF to JSON." }, { inlineData: fileData }] }, 
      config: { responseMimeType: "application/json" } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { return null; }
};
