export interface ChantRecord {
  id: string;
  chantName: string;
  count: number;
  timestamp: number; // Unix timestamp
  date: string; // YYYY-MM-DD format
}

export interface ChantGoal {
  chantName: string;
  daily?: number;
  monthly?: number;
  yearly?: number;
  lifetime?: number;
}

export interface Sutra {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface UserSettings {
  availableChants: string[]; // Auto-sorted by phonetic order
  goals: ChantGoal[];
  statsTabOrder?: string[]; // Custom order for Stats page tabs
  sutrasOrder?: string[]; // Custom order for Sutras list
}

export interface ChantStats {
  chantName: string;
  total: number;
  today: number;
  thisMonth: number;
  thisYear: number;
  history: { date: string; count: number }[];
}

export type Page = 'counter' | 'stats' | 'sutras' | 'settings';
