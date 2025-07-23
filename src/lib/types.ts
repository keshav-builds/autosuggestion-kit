import type * as React from "react";
export interface SuggestionItem {
  id: string | number
  label: string
  value?: string
  metadata?: {
    category?: string
    description?: string
    [key: string]: any
  }
}

export interface AutoSuggestionProps {
  // Data sources
  suggestions?: SuggestionItem[]
  fetchSuggestions?: (query: string) => Promise<SuggestionItem[]>
  defaultSuggestions?: SuggestionItem[]
  showDefaultOnFocus?: boolean

  // History management (built-in)
  enableHistory?: boolean
  historyKey?: string
  maxHistoryItems?: number

  // Behavior
  debounceMs?: number
  minQueryLength?: number
  maxSuggestions?: number
  cacheResults?: boolean

  // Input props
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string

  // Styling (CSS-in-JS approach)
  styles?: {
    container?: React.CSSProperties
    inputContainer?: React.CSSProperties
    input?: React.CSSProperties
    clearButton?: React.CSSProperties
    dropdown?: React.CSSProperties
    suggestion?: React.CSSProperties
    suggestionActive?: React.CSSProperties
    suggestionText?: React.CSSProperties
    suggestionMeta?: React.CSSProperties
    historyIcon?: React.CSSProperties
    removeButton?: React.CSSProperties
    loading?: React.CSSProperties
    noResults?: React.CSSProperties
  }

  // Class names for external styling
  classNames?: {
    container?: string
    inputContainer?: string
    input?: string
    clearButton?: string
    dropdown?: string
    suggestion?: string
    suggestionActive?: string
    suggestionText?: string
    suggestionMeta?: string
    historyIcon?: string
    removeButton?: string
    loading?: string
    noResults?: string
  }

  // Custom icons (as React elements or strings)
  icons?: {
    search?: React.ReactNode
    loading?: React.ReactNode
    clear?: React.ReactNode
    history?: React.ReactNode
    trending?: React.ReactNode
    remove?: React.ReactNode
  }

  // Event handlers
  onSelect?: (item: SuggestionItem) => void
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void

  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string

  // Custom rendering
  renderSuggestion?: (item: SuggestionItem, query: string, isActive: boolean) => React.ReactNode
  filterFunction?: (items: SuggestionItem[], query: string) => SuggestionItem[]

  // Additional input props
  [key: string]: any
}

export interface UseAutoSuggestionOptions {
  suggestions?: SuggestionItem[]
  fetchSuggestions?: (query: string) => Promise<SuggestionItem[]>
  defaultSuggestions?: SuggestionItem[]
  showDefaultOnFocus?: boolean
  enableHistory?: boolean
  historyKey?: string
  maxHistoryItems?: number
  debounceMs?: number
  minQueryLength?: number
  maxSuggestions?: number
  cacheResults?: boolean
  filterFunction?: (items: SuggestionItem[], query: string) => SuggestionItem[]
  onChange?: (value: string) => void
}
