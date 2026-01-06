
import { supabase } from './supabase';
import { User, ActivityLog, AdvisoryRequest, MarketRateEntry, Ship, Offer, Message, Shipowner, MarketReport } from "../types";

// FALLBACK VOOR NIEUWE INSTALLATIES
const BASELINE_REPORT: MarketReport = {
  lastUpdated: new Date().toLocaleDateString('nl-NL'),
  generalAdvisory: "Market Intelligence Desk - Active",
  shortseaIndex: 3100,
  shortseaChange: "+0.2%",
  regions: [
    { id: 'baltic', name: 'Baltic Sea', trend: 'stable', iconKey: 'globe', freightIndex: 3150, change: '0%', vesselsAvailable: '14 Coasters Spot', avgFreight: '€24.50', highlights: ['Ice restrictions monitoring active in Kemi.', 'Baltic grain export exposure increasing.'] },
    { id: 'northsea', name: 'North Sea / UKC', trend: 'stable', iconKey: 'globe', freightIndex: 2900, change: '0%', vesselsAvailable: '8 Coasters Spot', avgFreight: '€18.20', highlights: ['Port congestion alerts for major UKC hubs.', 'Steel coil demand validation stable.'] },
    { id: 'med', name: 'Mediterranean Sea', trend: 'firm', iconKey: 'globe', freightIndex: 2750, change: '+1.2%', vesselsAvailable: '6 Coasters Spot', avgFreight: '€21.10', highlights: ['High activity levels in East Med ports.', 'Bunker exposure monitoring for Algeciras.'] },
    { id: 'blacksea', name: 'Black Sea', trend: 'soft', iconKey: 'globe', freightIndex: 3400, change: '-0.5%', vesselsAvailable: '4 Coasters Spot', avgFreight: '€32.00', highlights: ['Risk premiums and insurance validation required.', 'Operational stability monitoring for Constanta.'] }
  ],
  bunkers: [
    { port: 'Rotterdam', price: 585, change: -2 },
    { port: 'Algeciras', price: 615, change: 5 },
    { port: 'Gdynia', price: 630, change: 0 }
  ],
  commodities: [
    { name: 'Wheat', status: 'HIGH', desc: 'Baltic exports peaking, increasing demand for 3000dwt units.' },
    { name: 'Steel Coils', status: 'STABLE', desc: 'UKC imports consistent, no immediate rate fluctuations.' }
  ],
  macroDrivers: [],
  freightHistory: [
    { month: 'Oct', index: 3050 }, { month: 'Nov', index: 3080 }, { month: 'Dec', index: 3100 }
  ],
  portVolumes: [],
  cargoDistribution: [
    { type: 'Bulk', percentage: 45 }, { type: 'Breakbulk', percentage: 25 }, { type: 'Container', percentage: 20 }, { type: 'Project', percentage: 10 }
  ]
};

export const seedDatabase = async () => {
  try {
    const { data: users } = await supabase.from('users').select('id').eq('email', 'admin@shortsea.com').maybeSingle();
    
    if (!users) {
      const admin: Partial<User> = {
        email: 'admin@shortsea.com',
        name: 'Admin HQ', 
        company: 'Shortsea Europe HQ',
        role: 'admin', 
        joinedAt: new Date().toISOString(), 
        emailVerified: true, 
        status: 'active',
        password: 'admin123'
      };
      await supabase.from('users').insert([admin]);
    }

    const { data: report } = await supabase.from('market_reports').select('id').maybeSingle();
    if (!report) {
      await supabase.from('market_reports').insert([{ data: BASELINE_REPORT, last_updated: new Date().toISOString() }]);
    }
  } catch (e) {
    console.error("Seed error:", e);
  }
};

export const storageService = {
  // GEBRUIKERS BEHEER
  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('users').select('*');
    return data || [];
  },

  saveUser: async (data: Partial<User>, pass: string): Promise<User> => {
    const newUser: Partial<User> = {
      email: data.email!,
      name: data.name!,
      company: data.company!,
      role: 'user',
      joinedAt: new Date().toISOString(),
      emailVerified: false,
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'active',
      subscriptionPlan: 'free',
      password: pass,
      ...data
    };
    const { data: insertedUser, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) throw error;
    return insertedUser;
  },

  loginUser: async (email: string, pass: string): Promise<{ user?: User, error?: string }> => {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (error || !user) return { error: 'not_found' };
    if (user.password !== pass) return { error: 'invalid_password' };
    if (!user.emailVerified) return { error: 'unverified' };
    return { user };
  },

  verifyUserEmail: async (email: string, code: string): Promise<boolean> => {
    const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (user && user.verificationCode === code) {
      await supabase.from('users').update({ emailVerified: true }).eq('email', email);
      return true;
    }
    return false;
  },

  resendVerificationCode: async (email: string): Promise<string | null> => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from('users').update({ verificationCode: newCode }).eq('email', email);
    return error ? null : newCode;
  },

  toggleUserStatus: async (id: string) => {
    const { data: user } = await supabase.from('users').select('status').eq('id', id).maybeSingle();
    if (user) {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      await supabase.from('users').update({ status: newStatus }).eq('id', id);
    }
  },

  updateUserSubscription: async (id: string, plan: string): Promise<boolean> => {
    const { error } = await supabase.from('users').update({ subscriptionPlan: plan }).eq('id', id);
    return !error;
  },

  // ACTIVITEITEN & LOGS
  logActivity: async (userId: string, userName: string, action: string, details: string, logData?: any) => {
    await supabase.from('activity_logs').insert([{
      userId, userName, action, details, timestamp: new Date().toISOString(), data: logData
    }]);
  },

  getUsageCount: async (userId?: string): Promise<number> => {
    const { count } = await supabase.from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId || 'guest')
      .in('action', ['QUOTE_CALCULATION', 'TOOL_USAGE']);
    return count || 0;
  },

  checkTrialStatus: (user: User) => {
    const joined = new Date(user.joinedAt).getTime();
    const now = Date.now();
    const daysLeft = Math.max(0, 7 - Math.floor((now - joined) / (1000 * 60 * 60 * 24)));
    return { expired: daysLeft <= 0, daysLeft };
  },

  // MARKT DATA (FIXTURES)
  getMarketRates: async (): Promise<MarketRateEntry[]> => {
    const { data } = await supabase.from('market_rates').select('*').order('date', { ascending: false });
    return data || [];
  },

  addMarketRate: async (rate: any) => {
    await supabase.from('market_rates').insert([rate]);
  },

  updateMarketRate: async (id: string, data: any) => {
    await supabase.from('market_rates').update(data).eq('id', id);
  },

  deleteMarketRate: async (id: string) => {
    await supabase.from('market_rates').delete().eq('id', id);
  },

  restoreMarketRates: async (newData: any[]) => {
    await supabase.from('market_rates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error } = await supabase.from('market_rates').insert(newData);
    if (error) throw error;
  },

  // VLOOT & SHIPOWNERS
  getFleet: async (): Promise<Ship[]> => {
    const { data } = await supabase.from('ships').select('*');
    return data || [];
  },

  addVessel: async (v: any) => {
    await supabase.from('ships').insert([v]);
  },

  deleteVessel: async (id: string) => {
    await supabase.from('ships').delete().eq('id', id);
  },

  getShipowners: async (): Promise<Shipowner[]> => {
    const { data } = await supabase.from('shipowners').select('*');
    return data || [];
  },

  deleteShipowner: async (id: string) => {
    await supabase.from('shipowners').delete().eq('id', id);
  },

  // OFFERS & DOSSIERS
  getOffers: async (): Promise<Offer[]> => {
    const { data } = await supabase.from('offers').select('*').order('createdAt', { ascending: false });
    return data || [];
  },

  createOffer: async (data: any) => {
    await supabase.from('offers').insert([{
      status: 'OPEN', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), correspondence: [], ...data
    }]);
  },

  // ADVISORIES
  getAdvisories: async (): Promise<AdvisoryRequest[]> => {
    const { data } = await supabase.from('advisories').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  saveAdvisory: async (req: AdvisoryRequest) => {
    await supabase.from('advisories').insert([req]);
  },

  updateAdvisory: async (id: string, text: string) => {
    await supabase.from('advisories').update({ finalAdvice: text, status: 'RELEASED' }).eq('id', id);
  },

  updateAdvisoryDraft: async (id: string, proAiDraft: string) => {
    await supabase.from('advisories').update({ proAiDraft }).eq('id', id);
  },

  deleteAdvisory: async (id: string) => {
    await supabase.from('advisories').delete().eq('id', id);
  },

  // QUICK SCANS
  getQuickScans: async (): Promise<any[]> => {
    const { data } = await supabase.from('quick_scans').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  saveQuickScan: async (scan: any) => {
    await supabase.from('quick_scans').insert([{
      timestamp: new Date().toISOString(), ...scan
    }]);
  },

  deleteQuickScan: async (id: string) => {
    await supabase.from('quick_scans').delete().eq('id', id);
  },

  // MESSAGES
  getMessages: async (): Promise<Message[]> => {
    const { data } = await supabase.from('messages').select('*').order('timestamp', { ascending: false });
    return data || [];
  },

  sendMessage: async (fromAdmin: boolean, userId: string, content: string, options: any = {}) => {
    await supabase.from('messages').insert([{
      fromAdmin, userId, content, timestamp: new Date().toISOString(), read: false, ...options
    }]);
  },

  deleteMessage: async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
  },

  // BUNKERS
  getBunkerEntries: async (): Promise<any[]> => {
    const { data } = await supabase.from('bunker_entries').select('*').order('date', { ascending: false });
    return data || [];
  },

  saveBunkerEntry: async (entry: any) => {
    if (entry.id) {
      await supabase.from('bunker_entries').update(entry).eq('id', entry.id);
    } else {
      await supabase.from('bunker_entries').insert([{ createdAt: new Date().toISOString(), ...entry }]);
    }
  },

  deleteBunkerEntry: async (id: string) => {
    await supabase.from('bunker_entries').delete().eq('id', id);
  },

  // GLOBAL MARKET REPORT
  getGlobalMarketReport: async (): Promise<MarketReport | null> => {
    const { data } = await supabase.from('market_reports').select('data').order('last_updated', { ascending: false }).limit(1).maybeSingle();
    return data ? data.data : null;
  },

  saveGlobalMarketReport: async (report: MarketReport) => {
    await supabase.from('market_reports').insert([{ data: report, last_updated: new Date().toISOString() }]);
  },

  claimGuestData: async (userId: string, userName: string, userCompany: string) => {
    await supabase.from('quick_scans').update({ userId, userName, userCompany }).eq('userId', 'guest');
    await supabase.from('messages').update({ userId }).eq('userId', 'guest');
  }
};
