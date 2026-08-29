import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type TaggedItem = {
  id: string;
  sermonId: string;
  text: string;
  completed?: boolean;
  createdAt: string;
};

export type ScriptureReference = {
  id: string;
  sermonId: string;
  reference: string;
  verseText: string;
};

export type Sermon = {
  id: string;
  title: string;
  church: string;
  pastor: string;
  series: string;
  date: string;
  mainScripture: string;
  notes: string;
  notesHtml?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  keyPoints: TaggedItem[];
  prayers: TaggedItem[];
  applications: TaggedItem[];
  reminders: TaggedItem[];
  scriptures: ScriptureReference[];
};

export type SavedVerse = {
  id: string;
  reference: string;
  verseText: string;
  dateSaved: string;
};

type AppContextValue = {
  sermons: Sermon[];
  savedVerses: SavedVerse[];
  loading: boolean;
  activeSermonId: string | null;
  setActiveSermonId: (id: string | null) => void;
  createSermon: (details: Pick<Sermon, 'title' | 'church' | 'pastor' | 'series' | 'date' | 'mainScripture'>) => Sermon;
  updateSermon: (id: string, updates: Partial<Sermon>) => void;
  addTaggedItem: (sermonId: string, kind: 'keyPoints' | 'prayers' | 'applications' | 'reminders', text: string) => void;
  appendScripture: (sermonId: string, reference: string, verseText: string) => void;
  toggleItem: (sermonId: string, kind: 'prayers' | 'applications' | 'reminders', itemId: string) => void;
  saveVerse: (reference: string, verseText: string) => void;
  removeSavedVerse: (id: string) => void;
};

const STORAGE_KEY = '@sermon-notes/state-v1';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const now = new Date();
const isoToday = now.toISOString().slice(0, 10);
const seedSermon: Sermon = {
  id: 'seed-grace',
  title: 'The Practice of Grace',
  church: 'Harbor Community Church',
  pastor: 'Pastor Michael Reed',
  series: 'Everyday Faith',
  date: isoToday,
  mainScripture: 'Ephesians 2:8-10',
  notes: 'Grace is not a finish line. It is the ground we stand on while we learn to walk.\n\nWe do not earn our way into God’s presence; we respond to the welcome already given.',
  createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
  updatedAt: new Date(now.getTime() - 86400000).toISOString(),
  completed: true,
  keyPoints: [{ id: 'kp-1', sermonId: 'seed-grace', text: 'Grace is the ground we stand on, not a finish line.', createdAt: new Date().toISOString() }],
  prayers: [{ id: 'pr-1', sermonId: 'seed-grace', text: 'Notice where I am trying to earn what God has already given.', createdAt: new Date().toISOString(), completed: false }],
  applications: [{ id: 'ap-1', sermonId: 'seed-grace', text: 'Receive one good thing today without trying to repay it.', createdAt: new Date().toISOString(), completed: false }],
  reminders: [{ id: 'rm-1', sermonId: 'seed-grace', text: 'Grace meets me before I am ready.', createdAt: new Date().toISOString(), completed: false }],
  scriptures: [{ id: 'sc-1', sermonId: 'seed-grace', reference: 'Ephesians 2:8-10', verseText: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.' }],
};

const seedSecondSermon: Sermon = {
  ...seedSermon,
  id: 'seed-presence',
  title: 'A Life That Listens',
  church: 'Harbor Community Church',
  pastor: 'Pastor Michael Reed',
  series: 'Everyday Faith',
  date: new Date(now.getTime() - 86400000 * 7).toISOString().slice(0, 10),
  mainScripture: 'Psalm 23',
  notes: 'The Shepherd is not rushed. Learning to listen begins by making room for stillness.',
  createdAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
  updatedAt: new Date(now.getTime() - 86400000 * 6).toISOString(),
  completed: true,
  keyPoints: [{ id: 'kp-2', sermonId: 'seed-presence', text: 'Stillness is a posture of trust.', createdAt: new Date().toISOString() }],
  prayers: [],
  applications: [{ id: 'ap-2', sermonId: 'seed-presence', text: 'Leave ten quiet minutes before reaching for my phone.', createdAt: new Date().toISOString(), completed: true }],
  reminders: [],
  scriptures: [{ id: 'sc-2', sermonId: 'seed-presence', reference: 'Psalm 23', verseText: 'The Lord is my shepherd; I shall not want.' }],
};

const seedSavedVerses: SavedVerse[] = [
  { id: 'sv-1', reference: 'Romans 8:28', verseText: 'And we know that for those who love God all things work together for good.', dateSaved: isoToday },
];

const defaultState = { sermons: [seedSermon, seedSecondSermon], savedVerses: seedSavedVerses };

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSermonId, setActiveSermonId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as typeof defaultState;
          setSermons(parsed.sermons ?? defaultState.sermons);
          setSavedVerses(parsed.savedVerses ?? defaultState.savedVerses);
        } catch {
          setSermons(defaultState.sermons);
          setSavedVerses(defaultState.savedVerses);
        }
      } else {
        setSermons(defaultState.sermons);
        setSavedVerses(defaultState.savedVerses);
      }
      setLoading(false);
    }).catch(() => {
      setSermons(defaultState.sermons);
      setSavedVerses(defaultState.savedVerses);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ sermons, savedVerses })).catch(() => undefined);
    }
  }, [sermons, savedVerses, loading]);

  const value = useMemo<AppContextValue>(() => ({
    sermons,
    savedVerses,
    loading,
    activeSermonId,
    setActiveSermonId,
    createSermon: (details) => {
      const created: Sermon = {
        ...details,
        id: makeId(),
        notes: '',
        notesHtml: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false,
        keyPoints: [],
        prayers: [],
        applications: [],
        reminders: [],
        scriptures: [],
      };
      setSermons((current) => [created, ...current]);
      setActiveSermonId(created.id);
      return created;
    },
    updateSermon: (id, updates) => {
      setSermons((current) => current.map((sermon) => sermon.id === id ? { ...sermon, ...updates, updatedAt: new Date().toISOString() } : sermon));
    },
    addTaggedItem: (sermonId, kind, text) => {
      const item: TaggedItem = { id: makeId(), sermonId, text, createdAt: new Date().toISOString(), completed: false };
      setSermons((current) => current.map((sermon) => sermon.id === sermonId ? { ...sermon, [kind]: [...sermon[kind], item], updatedAt: new Date().toISOString() } : sermon));
    },
    appendScripture: (sermonId, reference, verseText) => {
      setSermons((current) => current.map((sermon) => {
        if (sermon.id !== sermonId) return sermon;
        if (sermon.scriptures.some((item) => item.reference === reference)) return sermon;
        const item: ScriptureReference = { id: makeId(), sermonId, reference, verseText };
        const prefix = sermon.notes.trim().length ? `${sermon.notes.trim()}\n\n` : '';
        const existingRich = sermon.notesHtml?.trim()
          ? sermon.notesHtml
          : escapeHtml(sermon.notes).replace(/\n/g, '<br>');
        const richPrefix = existingRich.trim().length ? `${existingRich}<div><br></div>` : '';
        return {
          ...sermon,
          notes: `${prefix}${reference}\n${verseText}`,
          notesHtml: `${richPrefix}<div>${escapeHtml(reference)}</div><div>${escapeHtml(verseText)}</div>`,
          scriptures: [...sermon.scriptures, item],
          updatedAt: new Date().toISOString(),
        };
      }));
    },
    toggleItem: (sermonId, kind, itemId) => {
      setSermons((current) => current.map((sermon) => sermon.id === sermonId ? { ...sermon, [kind]: sermon[kind].map((item) => item.id === itemId ? { ...item, completed: !item.completed } : item), updatedAt: new Date().toISOString() } : sermon));
    },
    saveVerse: (reference, verseText) => {
      setSavedVerses((current) => current.some((verse) => verse.reference === reference) ? current : [{ id: makeId(), reference, verseText, dateSaved: new Date().toISOString().slice(0, 10) }, ...current]);
    },
    removeSavedVerse: (id) => setSavedVerses((current) => current.filter((verse) => verse.id !== id)),
  }), [sermons, savedVerses, loading, activeSermonId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}

export function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
