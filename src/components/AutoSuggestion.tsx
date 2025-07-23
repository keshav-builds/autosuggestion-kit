
import  * as React from "react"
import { forwardRef, useState, useEffect } from "react";
import type { AutoSuggestionProps, SuggestionItem } from "../lib/types"
import { useAutoSuggestion } from "../lib/hooks/use-autosuggestion"
import { highlightMatch } from "../lib/utils"

// Global CSS keyframes for spinner animation
const spinnerKeyframes = `
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive font and padding scaling */
@media (max-width: 600px) {
  .autosuggest-input {
    font-size: 0.875rem !important; /* 14px */
    padding-left: 1.5rem !important; /* 24px */
    padding-right: 1.5rem !important; /* 24px */
  }

  .autosuggest-dropdown {
    max-height: 200px !important;
  }
}
`

if (typeof document !== "undefined") {
  const styleEl = document.createElement("style")
  styleEl.textContent = spinnerKeyframes
  document.head.appendChild(styleEl)
}


const Spinner = () => (
  <div
    style={{
      width: 16,
      height: 16,
      border: "2px solid rgba(100, 116, 139, 0.2)",
      borderTopColor: "#3b82f6",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      boxSizing: "border-box",
    }}
    aria-hidden="true"
  />
)


const defaultStyles = {
  container: {
    position: "relative" as const,
    width: "100%",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  inputContainer: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "0.75rem 2.5rem 0.75rem 2.5rem", // 12px top/bottom, 40px left/right => rem approx 0.75rem/2.5rem
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: "0.5rem", // 8px
    fontSize: "1rem", // 16px
    outline: "none",
    transition: "border-color 0.2s ease",
    backgroundColor: "#ffffff",
  },
  inputFocused: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 0.1875rem rgba(59, 130, 246, 0.1)", // 3px = 0.1875rem
  },
  searchIcon: {
    position: "absolute" as const,
    left: "0.75rem", // 12px
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    pointerEvents: "none" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1rem", // 16px
    height: "1rem",
  },
  clearButton: {
    position: "absolute" as const,
    right: "0.75rem", // 12px
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    padding: "0.25rem", // 4px
    borderRadius: "0.25rem", // 4px
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "0.25rem", // 4px
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem", // 8px
    boxShadow: "0 0.625rem 1.5625rem rgba(0, 0, 0, 0.1)", 
    maxHeight: "18.75rem", // 300px
    overflowY: "auto" as const,
    zIndex: 1000,
  },
  suggestion: {
    padding: "0.75rem 1rem", // 12px 16px
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background-color 0.15s ease",
  },
  suggestionActive: {
    backgroundColor: "#f8fafc",
  },
  suggestionHover: {
    backgroundColor: "#f1f5f9",
  },
  suggestionContent: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  suggestionText: {
    marginLeft: "0.5rem", // 8px
    fontSize: "0.875rem", // 14px
    color: "#1e293b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  suggestionMeta: {
    fontSize: "0.75rem", // 12px
    color: "#64748b",
    marginLeft: "0.5rem", // 8px
  },
  historyIcon: {
    width: "0.875rem", // 14px
    height: "0.875rem",
    color: "#64748b",
    flexShrink: 0,
  },
  removeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem", // 4px
    borderRadius: "0.25rem", // 4px
    color: "#64748b",
    opacity: 0,
    transition: "opacity 0.2s ease, color 0.2s ease",
  },
  removeButtonVisible: {
    opacity: 1,
  },
  loading: {
    padding: "1rem",
    textAlign: "center" as const,
    color: "#64748b",
    fontSize: "0.875rem", // 14px
  },
  noResults: {
    padding: "1rem",
    textAlign: "center" as const,
    color: "#64748b",
    fontSize: "0.875rem", // 14px
  },
}

const defaultIcons = {
  search: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  loading: (
    <div
      style={{
        width: 16,
        height: 16,
        border: "2px solid rgba(100, 116, 139, 0.2)",
        borderTopColor: "#3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        boxSizing: "border-box",
      }}
      aria-hidden="true"
    />
  ),
  clear: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  history: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  trending: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  remove: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

const AutoSuggestion = forwardRef<HTMLInputElement, AutoSuggestionProps>((props, ref) => {
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
    placeholder = "Type to search...",
    value,
    defaultValue,
    disabled = false,
    required = false,
    name,
    id,
    styles = {},
    classNames = {},
    icons = {},
    onSelect,
    onChange,
    onFocus,
    onBlur,
    ariaLabel = "Search with autosuggestions",
    ariaDescribedBy,
    renderSuggestion,
    filterFunction,
    ...inputProps
  } = props

  const [inputFocused, setInputFocused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  const {
    query,
    setQuery,
    filteredSuggestions,
    isLoading,
    isOpen,
    selectedIndex,
    error,
    history,
    handleInputChange,
    handleKeyDown: hookHandleKeyDown,
    handleSelect,
    handleFocus: hookHandleFocus,
    handleBlur: hookHandleBlur,
    clearQuery,
    removeFromHistory,
  } = useAutoSuggestion({
    suggestions,
    fetchSuggestions,
    defaultSuggestions,
    showDefaultOnFocus,
    enableHistory,
    historyKey,
    maxHistoryItems,
    debounceMs,
    minQueryLength,
    maxSuggestions,
    cacheResults,
    filterFunction,
    onChange,
  })

  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value)
    }
  }, [value, query, setQuery])

  useEffect(() => {
    if (defaultValue && !query) {
      setQuery(defaultValue)
    }
  }, [defaultValue, query, setQuery])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      hookHandleKeyDown(event)
      return
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        hookHandleKeyDown(event)
        break
      case "Enter":
        event.preventDefault()
        if (selectedIndex >= 0) {
          const item = filteredSuggestions[selectedIndex]
          handleSelect(item)
          onSelect?.(item)
        } else if (filteredSuggestions.length > 0) {
          const item = filteredSuggestions[0]
          handleSelect(item)
          onSelect?.(item)
        }
        break
      case "Escape":
        hookHandleKeyDown(event)
        break
      default:
        hookHandleKeyDown(event)
        break
    }
  }

  const handleInputFocus = () => {
    setInputFocused(true)
    hookHandleFocus()
    onFocus?.()
  }

  const handleInputBlur = () => {
    setInputFocused(false)
    hookHandleBlur()
    onBlur?.()
  }

  const handleSuggestionClick = (item: SuggestionItem) => {
    handleSelect(item)
    onSelect?.(item)
  }

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>, itemId: string | number) => {
    event.preventDefault()
    event.stopPropagation()
    removeFromHistory(itemId)
  }

  const defaultRenderSuggestion = (
    item: SuggestionItem,
    searchQuery: string,
    isActive: boolean
  ) => {
    const isHistoryItem = history.some((h) => h.id === item.id)
    const isDefaultSuggestion = (defaultSuggestions ?? []).some((d: SuggestionItem) => d.id === item.id)

    return (
      <div style={{ ...defaultStyles.suggestionContent, ...styles.suggestionContent }}>
        {isHistoryItem && (
          <div style={{ ...defaultStyles.historyIcon, ...styles.historyIcon }}>
            {icons.history || defaultIcons.history}
          </div>
        )}
        {isDefaultSuggestion && !isHistoryItem && (
          <div style={{ ...defaultStyles.historyIcon, ...styles.historyIcon }}>
            {icons.trending || defaultIcons.trending}
          </div>
        )}
        <span style={{ ...defaultStyles.suggestionText, ...styles.suggestionText }}>
          {searchQuery ? highlightMatch(item.label, searchQuery) : item.label}
        </span>
        {item.metadata?.category && (
          <span style={{ ...defaultStyles.suggestionMeta, ...styles.suggestionMeta }}>
            {item.metadata.category}
          </span>
        )}
      </div>
    )
  }

  const mergedStyles = {
    container: { ...defaultStyles.container, ...styles.container },
    inputContainer: { ...defaultStyles.inputContainer, ...styles.inputContainer },
    input: {
      ...defaultStyles.input,
      ...(inputFocused ? defaultStyles.inputFocused : {}),
      ...styles.input,
    },
    dropdown: { ...defaultStyles.dropdown, ...styles.dropdown },
    loading: { ...defaultStyles.loading, ...styles.loading },
    noResults: { ...defaultStyles.noResults, ...styles.noResults },
  }

  return (
    <div style={mergedStyles.container} className={classNames.container}>
      {/* Input Container */}
      <div style={mergedStyles.inputContainer} className={classNames.inputContainer}>
        {/* Left Icon - Search or Loading Spinner */}
        <div style={{ ...defaultStyles.searchIcon, ...styles.searchIcon }} className={classNames.searchIcon}>
          {isLoading ? icons.loading || defaultIcons.loading : icons.search || defaultIcons.search}
        </div>

        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
          style={mergedStyles.input}
          className={`${classNames.input || ""} autosuggest-input`}
          {...inputProps}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            style={{ ...defaultStyles.clearButton, ...styles.clearButton }}
            className={classNames.clearButton}
            aria-label="Clear search"
          >
            {icons.clear || defaultIcons.clear}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#ef4444" }} role="alert">
          {error}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div style={mergedStyles.dropdown} className={`${classNames.dropdown || ""} autosuggest-dropdown`}>
          {!isLoading && filteredSuggestions.length === 0 && query.length >= minQueryLength && (
            <div style={mergedStyles.noResults} className={classNames.noResults}>
              No suggestions found
            </div>
          )}

          {!isLoading && filteredSuggestions.length === 0 && query.length === 0 && (
            <div style={mergedStyles.noResults} className={classNames.noResults}>
              {showDefaultOnFocus || enableHistory ? "No suggestions available" : "Start typing to see suggestions"}
            </div>
          )}

          {!isLoading && filteredSuggestions.length > 0 && (
            <ul
              role="listbox"
              aria-label="Suggestions"
              style={{ margin: 0, padding: 0, listStyle: "none" }}
            >
              {filteredSuggestions.map((item, index) => {
                const isActive = index === selectedIndex
                const isHovered = index === hoveredIndex
                const isHistoryItem = history.some((h) => h.id === item.id)

                return (
                  <li
                    key={`${item.id}-${index}`}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={isActive}
                    style={{
                      ...defaultStyles.suggestion,
                      ...(isActive ? defaultStyles.suggestionActive : {}),
                      ...(isHovered ? defaultStyles.suggestionHover : {}),
                      ...styles.suggestion,
                      ...(isActive ? styles.suggestionActive : {}),
                    }}
                    className={`${classNames.suggestion || ""} ${
                      isActive ? classNames.suggestionActive || "" : ""
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(-1)}
                    onMouseDown={(e) => {
                      // Prevent blur on input when clicking suggestion except remove button
                      const target = e.target as HTMLElement
                      if (!target.closest('button[aria-label*="Remove"]')) {
                        e.preventDefault()
                      }
                    }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement
                      if (!target.closest('button[aria-label*="Remove"]')) {
                        handleSuggestionClick(item)
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      {renderSuggestion
                        ? renderSuggestion(item, query, isActive)
                        : defaultRenderSuggestion(item, query, isActive)}

                      {isHistoryItem && enableHistory && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveClick(e, item.id)}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          style={{
                            ...defaultStyles.removeButton,
                            ...(isHovered ? defaultStyles.removeButtonVisible : {}),
                            ...styles.removeButton,
                          }}
                          className={classNames.removeButton}
                          aria-label={`Remove ${item.label} from history`}
                          tabIndex={-1}
                        >
                          {icons.remove || defaultIcons.remove}
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
})

AutoSuggestion.displayName = "AutoSuggestion"

export default AutoSuggestion
