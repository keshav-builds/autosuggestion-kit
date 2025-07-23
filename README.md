
# # AutoSuggestion Kit

A lightweight, accessible React autosuggestion component with built-in support for:

-   **Static and async suggestions**  — use local arrays or fetch suggestions dynamically
    
-   **Keyboard navigation**  — arrow up/down to navigate, enter to select, escape to close
    
-   **Search history**  — remembers recent selections automatically via localStorage
    
-   **Debouncing**  — delays user input processing to reduce unnecessary fetches
    
-   **Caching**  — caches previous async queries for faster repeated results
    
-   **Customizable styling and rendering**  — easily adapt to your project’s needs



## Basic Usage with Static Suggestions

```javascript
import React from "react"
import { AutoSuggestion, SuggestionItem } from "autosuggestion-kit"

const fruits: SuggestionItem[] = [
  { id: 1, label: "Apple", metadata: { category: "Fruit" } },
  { id: 2, label: "Banana", metadata: { category: "Fruit" } },
  { id: 3, label: "Cherry", metadata: { category: "Fruit" } },
  // ...more items
]

const trendingSearches: SuggestionItem[] = [
  { id: "trending-1", label: "Popular searches", metadata: { category: "Trending" } },
  { id: "trending-2", label: "Latest updates", metadata: { category: "Trending" } },
]

export default function App() {
  const handleSelect = (item: SuggestionItem) => {
    console.log("Selected:", item)
  }

  return (
    <AutoSuggestion
      suggestions={fruits}
      defaultSuggestions={trendingSearches}
      showDefaultOnFocus={true}
      enableHistory={true}
      historyKey="fruits-demo"
      placeholder="Search for fruits..."
      onSelect={handleSelect}
    />
  )
}

```

## Async Suggestions Example
```javascript
import React from "react"
import { AutoSuggestion, SuggestionItem } from "autosuggestion-kit"

// Simulate async API fetch with delay
const fetchSuggestions = async (query: string): Promise<SuggestionItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Your real fetch would go here
  const fruits = [
    { id: 1, label: "Apple" },
    { id: 2, label: "Banana" },
    { id: 3, label: "Cherry" },
  ]

  return fruits.filter(fruit =>
    fruit.label.toLowerCase().includes(query.toLowerCase())
  )
}

export default function AsyncSearch() {
  return (
    <AutoSuggestion
      fetchSuggestions={fetchSuggestions}
      enableHistory={true}
      historyKey="async-demo"
      placeholder="Search fruits (async)..."
      debounceMs={300}
      minQueryLength={1}
      onSelect={(item) => alert(`Selected: ${item.label}`)}
    />
  )
}

```
## Icon Customization Example
> **Note:** You can customize or remove the built-in icons by passing an icons prop
```jsx
<AutoSuggestion
  {...otherProps}
  icons={{
    search: null, // removes the search icon completely
    loading: <YourCustomLoader />,
    clear: <YourCustomClearIcon />,
  }}
/>
```

## Installation
Install my-project with npm

```bash
  npm install autosuggestion-kit
  
```
## Main Props

| Prop / Function       | Purpose / Description                                              | Example Value                       |
|----------------------|-------------------------------------------------------------------|-----------------------------------|
| `suggestions`         | Static array of suggestion items to display                      | `[ { id: 1, label: "Apple" }, ... ]` |
| `fetchSuggestions`    | Async function to fetch suggestions based on input query        | `async (query) => [...]`           |
| `defaultSuggestions`  | Suggestions shown when input is empty or on focus                | `[ { id: "t1", label: "Popular" }]` |
| `showDefaultOnFocus`  | Whether to show defaultSuggestions when input is focused and empty | `true`                            |
| `enableHistory`       | Enables saving and showing recently selected items               | `true`                            |
| `historyKey`          | Key string to store history in localStorage                      | `"fruits-demo"`                   |
| `debounceMs`          | Debounce delay in milliseconds for async fetch                   | `300`                            |
| `minQueryLength`      | Minimum characters required to trigger async fetch or filtering | `1`                              |
| `placeholder`         | Placeholder text for the search input                            | `"Search fruits..."`              |
| `onSelect`            | Callback called when user selects a suggestion                   | `(item) => console.log(item)`     |
| `onChange`            | Callback called on input value change                            | `(value) => console.log(value)`   |


## Demo link -soon
 
## Feedback

If you have any feedback, please contact us at developerkeshav200@gmail.com

