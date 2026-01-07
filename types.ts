
export type Language = 'en' | 'nl';

export interface CargoRequest {
  cargoType: string;
  volume: string;
  loadPort: string;
  dischargePort: string;
}

export interface RouteOption {
  name: string;
  estimatedRateLow: number;
  estimatedRateHigh: number;
  totalFreightLow: number;
  totalFreightHigh: number;
  voyageDays: number;
  distanceNm: number;
  co2Emission: number;
  euEtsCost: number;
  fuelCost: number;
  portFees: number;
  canalFees: number;
  waypoints: { lat: number; lng: number }[];
}

export interface QuoteResult {
  currency: string;
  marketAdvisoryEn: string;
  marketAdvisoryNl: string;
  weatherFactor: string;
  sources?: string[];
  
  estimatedRateLow: number;
  estimatedRateHigh: number;
  totalFreightLow: number;
  totalFreightHigh: number;
  co2Emission: number;
  euEtsCost: number;
  etsApplicable: boolean; 
  exemptionReason?: string;
  mrvRequired?: boolean;
  voyageDays: number;

  // INTELLIGENCE LAYERS
  marketSentiment: {
    status: 'OWNER_MARKET' | 'CHARTERER_MARKET' | 'BALANCED';
    score: number; // 0-100
    supplyIndicator: string;
    vesselSizeContext: string;
  };
  
  breakdown: {
    baseRate: number;
    bunkerAdjustment: number;
    seasonalPremium: number;
    portSurcharge: number;
  };

  negotiation: {
    targetRate: number;
    margin: string;
    focusPoints: string[];
    leverageLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    leverageTextEn: string;
    leverageTextNl: string;
  };

  historical: {
    lastMatchDate: string;
    lastMatchRate: number;
    trend30Days: string;
    seasonalNormDelta: string;
  };

  scenarios: {
    bunkerSensitivity: number; // impact of $50 increase
    flexibilitySavings: number; // potential savings for 7-day flex
    icePremium?: number;
  };
  
  routeDetails: {
    origin: { lat: number; lng: number; name: string };
    destination: { lat: number; lng: number; name: string };
    distanceNm: number;
    waypoints?: { lat: number; lng: number }[];
  };

  skagenAlternative?: {
    rateLow: number;
    rateHigh: number;
    lumpsumLow: number;
    lumpsumHigh: number;
    co2: number;
    days: number;
    distance: number;
    diffTextEn: string;
    diffTextNl: string;
    waypoints?: { lat: number; lng: number }[];
  };
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: UserRole;
  password?: string;
  phone?: string;
  joinedAt: string;
  subscriptionPlan?: 'free' | 'pro' | 'enterprise';
  emailVerified: boolean; 
  verificationCode?: string; 
  status?: 'active' | 'suspended';
}

export interface Ship {
  id: string;
  name: string;
  type: string;
  dwt: string;
  status: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface Shipowner {
  id: string;
  owner: string;
  contact?: string;
  tel: string;
  fax?: string;
  email: string;
  sizes?: string;
}

export interface AdvisoryRequest {
  id: string;
  userId: string;
  userName: string;
  userCompany: string;
  quoteText: string;
  serviceType: 'AI_INSTANT' | 'EXPERT_PREMIUM';
  status: 'PENDING' | 'RELEASED';
  aiDraft?: string;
  proAiDraft?: string; // New field for admin-generated persistent AI insight
  finalAdvice?: string;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Partial<User>, pass: string) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string | 'guest';
  userName: string;
  action: string;
  details: string; 
  timestamp: string;
  data?: any; 
}

export interface Message {
  id: string;
  fromAdmin: boolean;
  userId: string;
  content: string;
  timestamp: string;
  read: boolean;
  subject?: string;
  guestDetails?: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  type?: 'system' | 'inquiry' | 'chat';
}

export interface OfferMessage {
  id: string;
  sender: 'admin' | 'client';
  content: string;
  timestamp: string;
  isOfficialQuote?: boolean;
}

export interface Offer {
  id: string;
  userId: string | 'guest';
  userName: string;
  userCompany?: string;
  userEmail: string;
  status: 'OPEN' | 'QUOTED' | 'FIXED' | 'DECLINED';
  cargoDetails: {
    loadPort: string;
    dischargePort: string;
    cargo: string;
    volume: string;
    laycanStart: string;
    laycanEnd: string;
    terms: string;
    stowage: string;
    idea: string;
  };
  correspondence: OfferMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketRateEntry {
  id: string;
  date: string;
  loadPort: string;
  dischargePort: string;
  cargoType: string;
  freightRate: number;
  tonnage?: number;
  volume?: number;
  notes?: string;
}

export interface NavItem {
  label: { en: string; nl: string };
  path: string;
}

export interface MarketReport {
  lastUpdated: string;
  generalAdvisory: string;
  generalAdvisoryEn?: string;
  generalAdvisoryNl?: string;
  shortseaIndex: number;
  shortseaChange: string;
  bulkIndex?: number;
  bulkChange?: string;
  fleetCount?: number;
  regions: {
    id: string;
    name: string;
    trend: string;
    iconKey: string;
    freightIndex: number;
    change: string;
    vesselsAvailable?: string;
    avgFreight?: string;
    highlights: string[];
  }[];
  bunkers: { port: string; price: number; change: number }[];
  commodities: { name: string; status: string; desc: string }[];
  macroDrivers: { name: string; value: string; trend: string }[];
  freightHistory: { month: string; index: number }[];
  portVolumes: { port: string; volume: number }[];
  cargoDistribution: { type: string; percentage: number }[];
  debugRawSnippet?: string;
}
