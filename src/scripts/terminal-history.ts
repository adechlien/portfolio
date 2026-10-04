export const terminalHistoryKey = 'adechlien:terminal-history:v1';

export type TerminalResult =
  | { type: 'template'; name: string }
  | { type: 'text'; message: string; error: boolean; pending?: boolean }
  | { type: 'project'; name: string };

export interface TerminalEntry {
  command: string;
  results: TerminalResult[];
}

export function restoreTerminalHistory(serialized: string | null): TerminalEntry[] {
  if (!serialized) return [];
  try {
    const entries = JSON.parse(serialized);
    if (!Array.isArray(entries)) return [];
    const valid = entries.every(entry => typeof entry?.command === 'string' && Array.isArray(entry.results) && entry.results.every((result: TerminalResult) => {
      if (!result || typeof result !== 'object') return false;
      if (result.type === 'template') return ['help', 'whois', 'skills', 'projects', 'contact', 'palettes'].includes(result.name);
      if (result.type === 'project') return typeof result.name === 'string';
      return result.type === 'text' && typeof result.message === 'string' && typeof result.error === 'boolean' && (result.pending === undefined || typeof result.pending === 'boolean');
    }));
    if (!valid) return [];
    return entries.map((entry: TerminalEntry) => ({
      command: entry.command,
      results: entry.results.map(result => result.type === 'text' && result.pending
        ? { type: 'text', message: 'The page reloaded before delivery could be confirmed. This message has not been resent.', error: true }
        : result),
    }));
  } catch { return []; }
}

export function readTerminalHistory(): TerminalEntry[] {
  try { return restoreTerminalHistory(window.localStorage.getItem(terminalHistoryKey)); }
  catch { return []; }
}

export function saveTerminalHistory(entries: TerminalEntry[]) {
  try {
    if (entries.length) window.localStorage.setItem(terminalHistoryKey, JSON.stringify(entries));
    else window.localStorage.removeItem(terminalHistoryKey);
  } catch { /* Keep the current session usable when browser storage is unavailable. */ }
}
