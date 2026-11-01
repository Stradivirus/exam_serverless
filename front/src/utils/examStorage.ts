export interface ExamAttemptRecord {
  id: string;
  examType: string;
  examTitle: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
}

export interface WrongNoteItem {
  id: string;
  examType: string;
  examTitle: string;
  questionText: string;
  choices: Record<string, string>;
  userAnswer: string;
  correctAnswer: string;
  savedAt: string;
}

const HISTORY_KEY = 'cbt_attempt_history_v2';
const WRONG_NOTE_KEY = 'cbt_wrong_notes_v2';

export function getAttemptHistory(): ExamAttemptRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttemptRecord(record: Omit<ExamAttemptRecord, 'id' | 'timestamp'>): void {
  try {
    const history = getAttemptHistory();
    const newEntry: ExamAttemptRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...history].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function clearAttemptHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getWrongNotes(): WrongNoteItem[] {
  try {
    const raw = localStorage.getItem(WRONG_NOTE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWrongNotes(items: Omit<WrongNoteItem, 'savedAt'>[]): void {
  try {
    const existing = getWrongNotes();
    const now = new Date().toISOString();
    const map = new Map<string, WrongNoteItem>();

    existing.forEach((item) => map.set(`${item.examType}:${item.id}`, item));
    items.forEach((item) => {
      map.set(`${item.examType}:${item.id}`, {
        ...item,
        savedAt: now,
      });
    });

    const merged = Array.from(map.values()).slice(0, 100);
    localStorage.setItem(WRONG_NOTE_KEY, JSON.stringify(merged));
  } catch {
    // ignore storage errors
  }
}

export function removeWrongNote(examType: string, id: string): WrongNoteItem[] {
  const existing = getWrongNotes();
  const filtered = existing.filter((item) => !(item.examType === examType && item.id === id));
  localStorage.setItem(WRONG_NOTE_KEY, JSON.stringify(filtered));
  return filtered;
}

export function clearWrongNotes(): void {
  localStorage.removeItem(WRONG_NOTE_KEY);
}
