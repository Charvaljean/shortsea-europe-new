

import { GoogleGenAI, Type } from "@google/genai";
import { CargoRequest, QuoteResult, MarketReport } from "../types";

const aiModel = "gemini-3-flash-preview";

const MARITIME_ROUTING_ENGINE_SPEC = `
  ROLE: Lead Maritime Navigator.
  STRICT WATER-ONLY PROTOCOL: 
  - NEVER cross land. Maintain a 15nm buffer from any coastline.
  - Waypoints: Provide at least 40 coordinates ({lat, lng}) for EVERY route.
  
  MANDATORY GEOGRAPHIC NODES:
  - Baltic/North Sea: The Sound [55.61, 12.71], Skagen [57.74, 10.59], Kiel Canal [54.3, 10.1].
  - Gulf of Riga: ALWAYS use Cape Kolka [57.75, 22.60].
  - Med/Atlantic: Gibraltar [35.95, -5.35], Ushant [48.50, -5.50], Dover Strait [51.10, 1.50].
`;

const CHARTERER_ADVISORY_RULES = `
  MANDATE: Charterer's Advocate. 
  - ALWAYS favor the Charterer. NEVER advise 'BBB'.
`;

const cleanAndParseJSON = (text: string | undefined) => {
  if (!text) return null;
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    const cleaned = text.substring(start, end + 1);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing failed", e);
    return null;
  }
};

export const getFreightQuote = async (req: CargoRequest, lang: string): Promise<QuoteResult & { sources?: string[] }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing in environment");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Calculate a High-Precision Maritime Strategy for ${req.volume}mt ${req.cargoType} from ${req.loadPort} to ${req.dischargePort}.
  Output raw JSON only. 
  Fields: estimatedRateLow, estimatedRateHigh, marketAdvisoryEn, marketAdvisoryNl, routeDetails (origin name, destination name, waypoints), negotiation, marketSentiment.`;
  
  try {
      const response = await ai.models.generateContent({ 
        model: aiModel, 
        contents: prompt, 
        config: { 
          systemInstruction: MARITIME_ROUTING_ENGINE_SPEC + "\n" + CHARTERER_ADVISORY_RULES,
          thinkingConfig: { thinkingBudget: 0 }
        } 
      });

      const result = cleanAndParseJSON(response.text);
      if (!result) throw new Error("Invalid AI response format");
      
      return { ...result, sources: [] };
  } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new Error(lang === 'nl' ? "Systeem synchronisatie fout. Probeer het opnieuw." : "System synchronization error. Please try again.");
  }
};

export const analyzeBrokerQuote = async (
  quoteText: string, 
  report: MarketReport | null, 
  manualRates: any[], 
  fileData?: { data: string, mimeType: string },
  aiDraft?: string
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key missing";

  const ai = new GoogleGenAI({ apiKey });
  const professionalPrompt = `Audit broker offer: "${quoteText}". Provide a Strategic Counter-Strategy for the Charterer.`;
  
  const parts: any[] = [{ text: professionalPrompt }];
  if (fileData) parts.push({ inlineData: fileData });

  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: { parts }, 
      config: { 
        systemInstruction: CHARTERER_ADVISORY_RULES,
        tools: [{googleSearch: {}}],
        thinkingConfig: { thinkingBudget: 0 }
      } 
    });
    
    const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter((chunk: any) => chunk.web)
        ?.map((chunk: any) => chunk.web.uri) || [];

    let textResult = response.text || "Analyse mislukt.";
    if (urls.length > 0) {
        textResult += "\n\n---\n**Geverifieerde Bronnen:**\n" + Array.from(new Set(urls)).map(u => `- ${u}`).join('\n');
    }
    return textResult;
  } catch (error: any) { 
      return "Systeem synchronisatie fout op de cloud server. Probeer het opnieuw."; 
  }
};

export const calculateRouteDistance = async (origin: string, destination: string, options: any) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Calculate sea distance from ${origin} to ${destination}. Return JSON with 'distance', 'routeDescription', and 'waypoints'.`;
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: prompt, 
      config: { systemInstruction: MARITIME_ROUTING_ENGINE_SPEC, thinkingConfig: { thinkingBudget: 0 } } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { throw new Error("Routeberekening mislukt."); }
};

export const generateMarketReport = async (): Promise<MarketReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });
  try {
      const response = await ai.models.generateContent({ 
        model: aiModel, 
        contents: "Generate Full Shortsea Market Intel report. Return JSON only.", 
        config: { tools: [{googleSearch: {}}], thinkingConfig: { thinkingBudget: 0 } } 
      });
      return cleanAndParseJSON(response.text);
  } catch (error: any) { throw new Error("Markt-sync vertraagd."); }
};

export const getIceRestrictions = async (port: string) => executeStrategicSearch(`Ice restrictions for ${port}. Output JSON.`);
export const estimatePortDisbursements = async (port: string, gt: number) => executeStrategicSearch(`D/A estimate for ${gt}GT vessel at ${port}. Output JSON.`);

const executeStrategicSearch = async (prompt: string): Promise<any> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({ 
          model: aiModel, 
          contents: prompt, 
          config: { tools: [{googleSearch: {}}], thinkingConfig: { thinkingBudget: 0 } } 
        });
        return cleanAndParseJSON(response.text);
    } catch (error) { return null; }
};

export const getLiveEUAPrice = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return 85.0;
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({ 
          model: aiModel, 
          contents: "Live ICE EUA price. Output JSON: {\"price\": number}", 
          config: { tools: [{googleSearch: {}}], thinkingConfig: { thinkingBudget: 0 } } 
        });
        return cleanAndParseJSON(response.text)?.price || 85.0;
    } catch (e) { return 85.0; }
};

export const findRealTimeShips = async (region: string, minDwt: number, maxDwt: number) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key missing";
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({ 
    model: aiModel, 
    contents: `Find open tonnage ${region} ${minDwt}-${maxDwt}dwt.`, 
    config: { tools: [{googleSearch: {}}], thinkingConfig: { thinkingBudget: 0 } } 
  });
  return response.text;
};

export const generateDeepDiveAnalysis = async (region: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key missing";
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: `Charterer Deep-Dive for ${region}.`, 
      config: { systemInstruction: CHARTERER_ADVISORY_RULES, tools: [{googleSearch: {}}], thinkingConfig: { thinkingBudget: 0 } } 
    });
    return response.text || "";
  } catch(e) { return "Analyse tijdelijk niet beschikbaar."; }
};

export const getCommodityStowage = async (commodity: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: `Stowage Factor for ${commodity}. JSON.`, 
      config: { thinkingConfig: { thinkingBudget: 0 } } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { return null; }
};

export const analyzeSofPdf = async (fileData: { data: string, mimeType: string }) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({ 
      model: aiModel, 
      contents: { parts: [{ text: "Extract SOF events to JSON." }, { inlineData: fileData }] }, 
      config: { thinkingConfig: { thinkingBudget: 0 } } 
    });
    return cleanAndParseJSON(response.text);
  } catch(e) { return null; }
};
