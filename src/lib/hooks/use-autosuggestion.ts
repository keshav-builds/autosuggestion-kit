

import type * as React from "react";

import { useState, useEffect, useCallback, useRef } from "react"
import type { SuggestionItem, UseAutoSuggestionOptions } from "../types"
import { debounce, defaultFilter, historyUtils } from "../utils"

export function useAutoSuggestion(options: UseAutoSuggestionOptions) {
  const {
    suggestions = [],
    fetchSuggestions,
    defaultSuggestions = [],
    showDefaultOnFocus = false,
    enableHistory = true,
    historyKey = "default",
    maxHistoryItems = 10,
    debounceMs = 300,
    minQueryLength = 1,
    maxSuggestions = 10,
    cacheResults = true,
    filterFunction = defaultFilter,
    onChange,
  } = options

  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<SuggestionItem[]>([])
  const [removedItems, setRemovedItems] = useState<Set<string | number>>(new Set())

  const cacheRef = useRef<Map<string, SuggestionItem[]>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load history on mount
  useEffect(() => {
    if (enableHistory) {
      setHistory(historyUtils.getHistory(historyKey))
    }
  }, [enableHistory, historyKey])

  // Reset removed items when history changes
  useEffect(() => {
    setRemovedItems(new Set())
  }, [history])

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!fetchSuggestions || searchQuery.length < minQueryLength) {
        setIsLoading(false)
        return
      }

      // Check cache first
      if (cacheResults && cacheRef.current.has(searchQuery)) {
        setIsLoading(false)
        return
      }

      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()
        const results = await fetchSuggestions(searchQuery)

        if (cacheResults) {
          cacheRef.current.set(searchQuery, results)
        }

        setError(null)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError("Failed to fetch suggestions")
        }
      } finally {
        setIsLoading(false)
      }
    }, debounceMs),
    [fetchSuggestions, minQueryLength, cacheResults, debounceMs],
  )

  // Get filtered suggestions
  const getFilteredSuggestions = useCallback(() => {
    let allSuggestions: SuggestionItem[] = []

    // Add fetched suggestions
    if (fetchSuggestions && query.length >= minQueryLength) {
      const cached = cacheRef.current.get(query)
      if (cached) {
        allSuggestions = [...cached]
      }
    } else {
      // Add static suggestions
      allSuggestions = [...suggestions]
    }

    // Add default suggestions when focused with empty query
    if (query.length === 0 && showDefaultOnFocus) {
      allSuggestions = [...defaultSuggestions, ...allSuggestions]
    }

    // Add history items (filtered by removed items)
    if (enableHistory && query.length === 0) {
      const validHistory = history.filter((item) => !removedItems.has(item.id))
      allSuggestions = [...validHistory, ...allSuggestions]
    }

    // Filter suggestions
    const filtered = query.length > 0 ? filterFunction(allSuggestions, query) : allSuggestions

    // Remove duplicates and limit results
    const unique = filtered.filter((item, index, arr) => arr.findIndex((i) => i.id === item.id) === index)

    return unique.slice(0, maxSuggestions)
  }, [
    suggestions,
    defaultSuggestions,
    history,
    query,
    showDefaultOnFocus,
    enableHistory,
    minQueryLength,
    maxSuggestions,
    filterFunction,
    fetchSuggestions,
    removedItems,
  ])

  const filteredSuggestions = getFilteredSuggestions()

  // Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      setSelectedIndex(-1)
      setError(null)
      onChange?.(value)

      if (fetchSuggestions && value.length >= minQueryLength) {
        setIsLoading(true)
        debouncedFetch(value)
      } else {
        setIsLoading(false)
      }

      if (!isOpen) {
        setIsOpen(true)
      }
    },
    [fetchSuggestions, minQueryLength, debouncedFetch, onChange, isOpen],
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          setSelectedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          event.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case "Escape":
          event.preventDefault()
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    },
    [isOpen, filteredSuggestions.length],
  )

  // Handle selection
  const handleSelect = useCallback(
    (item: SuggestionItem) => {
      setQuery(item.label)
      setIsOpen(false)
      setSelectedIndex(-1)

      // Add to history
      if (enableHistory) {
        const newHistory = historyUtils.addToHistory(historyKey, item, maxHistoryItems)
        setHistory(newHistory)
      }
    },
    [enableHistory, historyKey, maxHistoryItems],
  )

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsOpen(true)
    if (query.length === 0 && (showDefaultOnFocus || enableHistory)) {
      // Show default suggestions or history
    }
  }, [query.length, showDefaultOnFocus, enableHistory])

  // Handle blur
  const handleBlur = useCallback(() => {
    // Delay closing to allow for clicks
    setTimeout(() => setIsOpen(false), 150)
  }, [])

  // Clear query
  const clearQuery = useCallback(() => {
    setQuery("")
    setSelectedIndex(-1)
    setIsOpen(false)
    onChange?.("")
  }, [onChange])

  // Remove from history
  const removeFromHistory = useCallback(
    (itemId: string | number) => {
      setRemovedItems((prev) => new Set([...prev, itemId]))
      const newHistory = historyUtils.removeFromHistory(historyKey, itemId)
      setHistory(newHistory)
    },
    [historyKey],
  )

  return {
    query,
    setQuery,
    filteredSuggestions,
    isLoading,
    isOpen,
    selectedIndex,
    error,
    history,
    handleInputChange,
    handleKeyDown,
    handleSelect,
    handleFocus,
    handleBlur,
    clearQuery,
    removeFromHistory,
  }
}