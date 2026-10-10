import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';

export interface RankingItem {
  id?: string;
  playerName: string;
  score: number;
  level?: number;
  rescued?: boolean;
  createdAt: string;
}

export interface AnalyticsEvent {
  id?: string;
  visitorId: string;
  eventType: 'page_visit' | 'game_start' | 'game_victory' | 'game_over';
  gameMode?: 'single' | 'multiplayer';
  device?: string;
  timestamp: string;
}

// Generate unique clean id
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or generate persistent visitor ID
export function getVisitorId(): string {
  try {
    let visitorId = localStorage.getItem('cbr_visitor_id');
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('cbr_visitor_id', visitorId);
    }
    return visitorId;
  } catch {
    return `v_${Date.now()}`;
  }
}

// Detect device info
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Save player score to Firebase ranking collection
 */
export async function saveRankingScore(data: {
  playerName: string;
  score: number;
  level?: number;
  rescued?: boolean;
}): Promise<boolean> {
  const safeName = (data.playerName || 'Pollito Heroe').trim().substring(0, 50);
  const docId = `rank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const payload: RankingItem = {
    playerName: safeName,
    score: Math.max(0, Math.floor(data.score)),
    level: data.level || 1,
    rescued: Boolean(data.rescued),
    createdAt: new Date().toISOString(),
  };

  try {
    const rankRef = doc(db, 'ranking', docId);
    await setDoc(rankRef, payload);
    // Also store locally for instant responsiveness
    saveLocalRanking(payload);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `ranking/${docId}`);
    // Save locally if network issue
    saveLocalRanking(payload);
    return false;
  }
}

/**
 * Fetch Top 50 scores from Firebase ranking
 */
export async function getTopRankings(): Promise<RankingItem[]> {
  try {
    const rankingCol = collection(db, 'ranking');
    const q = query(rankingCol, orderBy('score', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return getLocalRankings();
    }

    const items: RankingItem[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as RankingItem;
      items.push({
        id: d.id,
        playerName: data.playerName,
        score: data.score,
        level: data.level || 1,
        rescued: data.rescued,
        createdAt: data.createdAt,
      });
    });

    // Merge with any local ones just in case
    const local = getLocalRankings();
    const combined = [...items];
    for (const loc of local) {
      if (!combined.some(c => c.playerName === loc.playerName && c.score === loc.score)) {
        combined.push(loc);
      }
    }
    return combined.sort((a, b) => b.score - a.score).slice(0, 50);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'ranking');
    return getLocalRankings();
  }
}

// Local fallback storage for Rankings
function saveLocalRanking(item: RankingItem) {
  try {
    const list = getLocalRankings();
    list.push(item);
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem('cbr_rankings', JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.warn(e);
  }
}

function getLocalRankings(): RankingItem[] {
  try {
    const raw = localStorage.getItem('cbr_rankings');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(e);
  }
  // Initial high scores for vibrant display if fresh
  return [
    { playerName: 'Rambo Pollito', score: 9850, level: 3, rescued: true, createdAt: new Date().toISOString() },
    { playerName: 'Gallinita Scout', score: 8400, level: 2, rescued: true, createdAt: new Date().toISOString() },
    { playerName: 'Capitán Gallo', score: 7200, level: 2, rescued: true, createdAt: new Date().toISOString() },
    { playerName: 'Granjero Boom', score: 6100, level: 1, rescued: false, createdAt: new Date().toISOString() },
    { playerName: 'Pollita Fuerte', score: 5500, level: 1, rescued: true, createdAt: new Date().toISOString() },
  ];
}

/**
 * Record analytics event to Firebase analytics collection
 */
export async function trackAnalytics(
  eventType: AnalyticsEvent['eventType'],
  gameMode: 'single' | 'multiplayer' = 'single'
): Promise<void> {
  const visitorId = getVisitorId();
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const payload: AnalyticsEvent = {
    visitorId,
    eventType,
    gameMode,
    device: getDeviceType(),
    timestamp: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'analytics', eventId);
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `analytics/${eventId}`);
  }

  // Also maintain local analytics counters for instant display in /admin
  try {
    const key = `cbr_stats_${eventType}`;
    const curr = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(curr + 1));
  } catch {}
}

/**
 * Fetch analytics summary for the /admin dashboard
 */
export async function getAnalyticsSummary(): Promise<{
  totalVisits: number;
  totalGamesStarted: number;
  totalVictories: number;
  totalGameOvers: number;
  recentEvents: AnalyticsEvent[];
}> {
  try {
    const analyticsCol = collection(db, 'analytics');
    const q = query(analyticsCol, orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    let totalVisits = 0;
    let totalGamesStarted = 0;
    let totalVictories = 0;
    let totalGameOvers = 0;
    const recentEvents: AnalyticsEvent[] = [];

    snapshot.forEach((d) => {
      const data = d.data() as AnalyticsEvent;
      recentEvents.push(data);
      if (data.eventType === 'page_visit') totalVisits++;
      else if (data.eventType === 'game_start') totalGamesStarted++;
      else if (data.eventType === 'game_victory') totalVictories++;
      else if (data.eventType === 'game_over') totalGameOvers++;
    });

    // Combine with local counts if db is fresh
    const localVisits = parseInt(localStorage.getItem('cbr_stats_page_visit') || '1', 10);
    const localStarts = parseInt(localStorage.getItem('cbr_stats_game_start') || '0', 10);
    const localVictories = parseInt(localStorage.getItem('cbr_stats_game_victory') || '0', 10);
    const localLosses = parseInt(localStorage.getItem('cbr_stats_game_over') || '0', 10);

    return {
      totalVisits: Math.max(totalVisits, localVisits),
      totalGamesStarted: Math.max(totalGamesStarted, localStarts),
      totalVictories: Math.max(totalVictories, localVictories),
      totalGameOvers: Math.max(totalGameOvers, localLosses),
      recentEvents,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'analytics');
    return {
      totalVisits: parseInt(localStorage.getItem('cbr_stats_page_visit') || '1', 10),
      totalGamesStarted: parseInt(localStorage.getItem('cbr_stats_game_start') || '0', 10),
      totalVictories: parseInt(localStorage.getItem('cbr_stats_game_victory') || '0', 10),
      totalGameOvers: parseInt(localStorage.getItem('cbr_stats_game_over') || '0', 10),
      recentEvents: [],
    };
  }
}
