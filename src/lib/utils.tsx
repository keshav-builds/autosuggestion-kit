import * as React from "react";
import type { SuggestionItem } from "./types";

// Debounce utility using ReturnType<typeof setTimeout>
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Highlight matching text: matched parts are bold
export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} style={{ fontWeight: "bold", padding: 0 }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

// Default filter function
export function defaultFilter(items: SuggestionItem[], query: string): SuggestionItem[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(lowerQuery) ||
      item.value?.toLowerCase().includes(lowerQuery) ||
      item.metadata?.category?.toLowerCase().includes(lowerQuery)
  );
}

// History management utilities
export const historyUtils = {
  getHistory: (key: string): SuggestionItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`autosuggestion_history_${key}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveHistory: (key: string, items: SuggestionItem[]): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`autosuggestion_history_${key}`, JSON.stringify(items));
    } catch {
      // ignore write errors
    }
  },

  addToHistory: (key: string, item: SuggestionItem, maxItems = 10): SuggestionItem[] => {
    const history = historyUtils.getHistory(key);
    const filtered = history.filter((h) => h.id !== item.id);
    const newHistory = [item, ...filtered].slice(0, maxItems);
    historyUtils.saveHistory(key, newHistory);
    return newHistory;
  },

  removeFromHistory: (key: string, itemId: string | number): SuggestionItem[] => {
    const history = historyUtils.getHistory(key);
    const newHistory = history.filter((h) => h.id !== itemId);
    historyUtils.saveHistory(key, newHistory);
    return newHistory;
  },
};

// Simple classnames combiner without dependencies
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(" ");
}
