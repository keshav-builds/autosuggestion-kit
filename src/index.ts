export { default as AutoSuggestion } from "./components/AutoSuggestion"
export { useAutoSuggestion } from "./lib/hooks/use-autosuggestion"
export { historyUtils, highlightMatch, defaultFilter, debounce } from "./lib/utils"
export type {
  AutoSuggestionProps,
  SuggestionItem,
  UseAutoSuggestionOptions,
} from "./lib/types"
