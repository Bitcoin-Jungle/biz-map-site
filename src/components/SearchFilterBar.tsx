import { useRef } from "react"
import { LangDict } from "../lang"
import { MerchantCategory } from "../types/btcmap"
import { categoryLabelKey } from "../lib/btcmap"
import { CATEGORY_GLYPH } from "../lib/markers"

const ALL_CATEGORIES: MerchantCategory[] = [
  "restaurant",
  "cafe",
  "hotel",
  "retail",
  "tourism",
  "health",
  "services",
  "transport",
  "other",
]

interface Props {
  query: string
  onQueryChange: (q: string) => void
  selectedCategories: Set<MerchantCategory>
  onToggleCategory: (c: MerchantCategory) => void
  onClearFilters: () => void
  localized: LangDict
}

export function SearchFilterBar({
  query,
  onQueryChange,
  selectedCategories,
  onToggleCategory,
  onClearFilters,
  localized,
}: Props) {
  const hasFilters = query.length > 0 || selectedCategories.size > 0
  const chipsRef = useRef<HTMLDivElement>(null)

  return (
    <div className="sfb-container">
      {/* Search row */}
      <div className="sfb-search-row">
        <span className="sfb-search-icon">🔍</span>
        <input
          className="sfb-search-input"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={localized["MapScreen.searchPlaceholder"] || "Search…"}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button className="sfb-clear-btn" onClick={() => onQueryChange("")} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* Category chips row */}
      <div className="sfb-chips-row" ref={chipsRef}>
        {ALL_CATEGORIES.map((cat) => {
          const active = selectedCategories.has(cat)
          return (
            <button
              key={cat}
              className={`sfb-chip${active ? " sfb-chip--active" : ""}`}
              onClick={() => onToggleCategory(cat)}
              aria-pressed={active}
            >
              <span className="sfb-chip-icon">{CATEGORY_GLYPH[cat]}</span>
              <span className="sfb-chip-label">
                {localized[categoryLabelKey(cat)] || cat}
              </span>
            </button>
          )
        })}
        {hasFilters && (
          <button className="sfb-chip sfb-chip--clear" onClick={onClearFilters}>
            {localized["MapScreen.clearFilters"] || "Clear"}
          </button>
        )}
      </div>
    </div>
  )
}
