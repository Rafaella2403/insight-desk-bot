import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Ticket, BatchRun, Theme, ThemeTicket, Feedback } from '@/types';
import { seedTickets, seedBatchRun, seedThemes, seedThemeTickets } from '@/data/seeds';
import { processTickets, ProcessingResult } from '@/utils/processing';

interface DataContextType {
  tickets: Ticket[];
  batchRuns: BatchRun[];
  themes: Theme[];
  themeTickets: ThemeTicket[];
  feedbacks: Feedback[];
  lastRun: BatchRun | null;
  importAndProcess: (raw: Array<{ id?: string; created_at?: string; subject?: string; body?: string; status?: string; tags?: string }>) => ProcessingResult;
  addFeedback: (fb: Omit<Feedback, 'id' | 'created_at'>) => void;
  getThemeTickets: (themeId: string) => Ticket[];
  getThemeFeedbacks: (themeId: string) => Feedback[];
}

const DataContext = createContext<DataContextType | null>(null);

function loadState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`insightdesk_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function saveState(key: string, value: unknown) {
  localStorage.setItem(`insightdesk_${key}`, JSON.stringify(value));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() => loadState('tickets', seedTickets));
  const [batchRuns, setBatchRuns] = useState<BatchRun[]>(() => loadState('batchRuns', [seedBatchRun]));
  const [themes, setThemes] = useState<Theme[]>(() => loadState('themes', seedThemes));
  const [themeTickets2, setThemeTickets] = useState<ThemeTicket[]>(() => loadState('themeTickets', seedThemeTickets));
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => loadState('feedbacks', []));

  const lastRun = batchRuns.length > 0 ? batchRuns[batchRuns.length - 1] : null;

  const importAndProcess = useCallback((raw: Array<{ id?: string; created_at?: string; subject?: string; body?: string; status?: string; tags?: string }>) => {
    const result = processTickets(raw, themes);
    const newTickets = [...tickets, ...result.tickets];
    const newRuns = [...batchRuns, result.batchRun];
    const newThemes = [...themes, ...result.themes];
    const newTT = [...themeTickets2, ...result.themeTickets];

    setTickets(newTickets);
    setBatchRuns(newRuns);
    setThemes(newThemes);
    setThemeTickets(newTT);

    saveState('tickets', newTickets);
    saveState('batchRuns', newRuns);
    saveState('themes', newThemes);
    saveState('themeTickets', newTT);

    return result;
  }, [tickets, batchRuns, themes, themeTickets2]);

  const addFeedback = useCallback((fb: Omit<Feedback, 'id' | 'created_at'>) => {
    const newFb: Feedback = {
      ...fb,
      id: `fb_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [...feedbacks, newFb];
    setFeedbacks(updated);
    saveState('feedbacks', updated);
  }, [feedbacks]);

  const getThemeTickets = useCallback((themeId: string) => {
    const ids = themeTickets2.filter(tt => tt.theme_id === themeId);
    return ids.map(tt => tickets.find(t => t.id === tt.ticket_id)).filter(Boolean) as Ticket[];
  }, [themeTickets2, tickets]);

  const getThemeFeedbacks = useCallback((themeId: string) => {
    return feedbacks.filter(f => f.theme_id === themeId);
  }, [feedbacks]);

  return (
    <DataContext.Provider value={{
      tickets, batchRuns, themes, themeTickets: themeTickets2, feedbacks,
      lastRun, importAndProcess, addFeedback, getThemeTickets, getThemeFeedbacks,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
