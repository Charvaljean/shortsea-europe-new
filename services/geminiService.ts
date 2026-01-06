

import { GoogleGenAI, Type } from "@google/genai";
import { CargoRequest, QuoteResult, MarketReport } from "../types";

const aiModel = "gemini-3-pro-preview";

const MARITIME_ROUTING_ENGINE_SPEC = `
  ROLE: Lead Maritime Navigator.
  STRICT WATER-ONLY PROTOCOL: 
  - NEVER cross land. Maintain a 15nm buffer from any coastline.
  - Waypoints: You MUST provide a high-density array of at least 40 coordinates ({lat, lng}) for EVERY route. This is critical for the map to draw a smooth, continuous dashed line that follows sea channels.
  
  ROUTE MAPPING:
  - 'routeDetails': MUST be the route using the Kiel Canal (for Baltic) or shortest sea path.
  - 'skagenAlternative': MUST be the alternative route via Skagen (around Denmark).
  
  MANDATORY GEOGRAPHIC NODES:
  - Baltic/North Sea: The Sound [55.61, 12.71], Skagen [57.74, 10.59], Kiel Canal entrance [54.3, 10.1].
  - Gulf of Riga: ALWAYS use Cape Kolka [57.75, 22.60] to avoid cutting through the Kurzeme peninsula.
  - Med/Atlantic: Gibraltar [35.95, -5.35], Ushant [48.50, -5.50], Dover Strait [51.10, 1.50].
`;

const CHARTERER_ADVISORY_RULES = `
  MANDATE: You are the Charterer's Advocate. 
  - ALWAYS favor the Charterer. NEVER advise 'BBB'.
  - You MUST populate all strategy fields: marketAdvisoryEn, marketAdvisoryNl, and the complete negotiation object.
  - If a field is missing, the platform fails.
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

export const getFreightQuote = async (req: CargoRequest, lang: string): Promise<QuoteResult & { sources?: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a High-Precision Maritime Strategy for ${req.volume}mt ${req.cargoType} from ${req.loadPort} to ${req.dischargePort}.
  
  REQUIRED JSON SCHEMA:
  {
    "estimatedRateLow": number,
    "estimatedRateHigh": number,
    "marketAdvisoryEn": "Detailed strategy text...",
    "marketAdvisoryNl": "Gedetailleerde strategie tekst...",
    "routeDetails": {
       "origin": {"lat": number, "lng": number, "name": "Exact Port Name"},
       "destination": {"lat": number, "lng": number, "name": "Exact Port Name"},
       "distanceNm": number,
       "waypoints": [{"lat": number, "lng": number}, ...] // MIN 40 POINTS
    },
    "skagenAlternative": {
       "rateLow": number, "rateHigh": number, "distance": number, "days": number,
       "waypoints": [{"lat": number, "lng": number}, ...] // MIN 40 POINTS
    },
    "negotiation": {
       "targetRate": number,
       "focusPoints": ["Point 1", "Point 2", "Point 3"],
       "leverageTextEn": "...", "leverageTextNl": "..."
    },
    "marketSentiment": {"status": "CHARTERER_MARKET", "score": 85},
    "voyageDays": number,
    "co2Emission": number,
    "euEtsCost": number,
    "etsApplicable": boolean
  }
  
  Ensure all fields are filled. Do not return empty arrays or nulls for advice.`;
  
  try {
      const response = await ai.models.generateContent({ 
        model: aiModel, 
        contents: prompt, 
        config: { 
          systemInstruction: MARITIME_ROUTING_ENGINE_SPEC + "\n" + CHARTERER_ADVISORY_RULES,
          tools: [{googleSearch: {}}],
          responseMimeType: "application/json"
        } 
      });

      const result = cleanAndParseJSON(response.text) || ({} as any);
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter((chunk: any) => chunk.web)
        ?.map((chunk: any) => chunk.web.uri) || [];

      return { ...result, sources };
  } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new Error("De maritieme server is overbelast. Klik a.u.b. nogmaals op de knop.");
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
  let context = `Recent Fixtures: ${JSON.stringify(manualRates.slice(0, 10))}`;
  const professionalPrompt = `Audit broker offer: "${quoteText}". ${context} Provide a Strategic Counter-Strategy for the Charterer using live market grounding. Focus on rate reduction and term improvements.`;
  
  const parts: any[] = [{ text: professionalPrompt }];
  if (fileData) parts.push({ inlineData: fileData });

  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: { parts }, 
      config: { 
        systemInstruction: CHARTERER_ADVISORY_RULES,
        tools: [{googleSearch: {}}] 
      } 
    });
    
    const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter((chunk: any) => chunk.web)
        ?.map((chunk: any) => chunk.web.uri) || [];

    let textResult = response.text || "Analyse mislukt.";
    if (urls.length > 0) {
        textResult += "\n\n---\n**Geverifieerde Bronnen (Market Grounding):**\n" + Array.from(new Set(urls)).map(u => `- ${u}`).join('\n');
    }
    return textResult;
  } catch (error: any) { 
      return "Systeem synchronisatie fout. Probeer het over een moment opnieuw."; 
  }
};

export const calculateRouteDistance = async (origin: string, destination: string, options: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Calculate sea distance from ${origin} to ${destination}. Return JSON with 'distance' (number), 'routeDescription' (string), and 'waypoints' (array of {lat, lng}, minimum 40 points). Use water paths only.`;
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: prompt, 
      config: { 
        systemInstruction: MARITIME_ROUTING_ENGINE_SPEC,
        responseMimeType: "application/json" 
      } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { throw new Error("Routeberekening mislukt."); }
};

export const generateMarketReport = async (): Promise<MarketReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Full Shortsea Market Intel Europe. Return JSON. Use Search for indices and bunkers. Focus on North Sea, Baltic, and Med regions.`;
  try {
      const response = await ai.models.generateContent({ 
        model: aiModel, 
        contents: prompt, 
        config: { 
          tools: [{googleSearch: {}}],
          responseMimeType: "application/json"
        } 
      });
      return cleanAndParseJSON(response.text);
  } catch (error: any) { 
      throw new Error("Markt-sync vertraagd."); 
  }
};

export const getIceRestrictions = async (port: string) => executeStrategicSearch(`Ice restrictions for ${port}. JSON.`);
export const estimatePortDisbursements = async (port: string, gt: number) => executeStrategicSearch(`D/A estimate for ${gt}GT vessel at ${port}. JSON.`);

const executeStrategicSearch = async (prompt: string): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({ 
          model: aiModel, 
          contents: prompt, 
          config: { tools: [{googleSearch: {}}], responseMimeType: "application/json" } 
        });
        return cleanAndParseJSON(response.text);
    } catch (error) { return null; }
};

export const getLiveEUAPrice = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({ 
          model: aiModel, 
          contents: "Live ICE EUA price. JSON: {\"price\": number}", 
          config: { tools: [{googleSearch: {}}], responseMimeType: "application/json" } 
        });
        return cleanAndParseJSON(response.text)?.price || 85.0;
    } catch (e) { return 85.0; }
};

export const findRealTimeShips = async (region: string, minDwt: number, maxDwt: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({ 
    model: aiModel, 
    contents: `Find open tonnage ${region} ${minDwt}-${maxDwt}dwt. Use Search.`, 
    config: { tools: [{googleSearch: {}}] } 
  });
  return response.text;
};

export const generateDeepDiveAnalysis = async (region: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: `Charterer Deep-Dive for ${region}.`, 
      config: { systemInstruction: CHARTERER_ADVISORY_RULES, tools: [{googleSearch: {}}] } 
    });
    return response.text || "";
  } catch(e) { return "Analyse tijdelijk niet beschikbaar."; }
};

export const getCommodityStowage = async (commodity: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: `Stowage Factor for ${commodity}. JSON.`, 
      config: { responseMimeType: "application/json" } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { return null; }
};

export const analyzeSofPdf = async (fileData: { data: string, mimeType: string }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: { parts: [{ text: "Extract SOF events to JSON." }, { inlineData: fileData }] }, 
      config: { responseMimeType: "application/json" } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { return null; }
};
