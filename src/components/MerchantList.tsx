import { useMemo } from "react"
import { BtcMapPlace } from "../types/btcmap"
import {
  categoryLabelKey,
  distanceKm,
  inferCategory,
  localized as localizedField,
  paymentMethods,
  verificationStatus,
} from "../lib/btcmap"
import { CATEGORY_GLYPH } from "../lib/markers"
import { LangDict } from "../lang"
import { UserCoords } from "../hooks/useUserLocation"

interface Props {
  places: BtcMapPlace[]
  userCoords: UserCoords | null
  onSelect: (p: BtcMapPlace) => void
  lastSync: string | null
  localized: LangDict
  lang: string
  hasFilters: boolean
  onClearFilters: () => void
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

function freshnessLabel(lastSync: string | null, loc: LangDict): string {
  if (!lastSync) return loc["MapScreen.loading"] || "Loading…"
  try {
    const age = (Date.now() - Date.parse(lastSync)) / 1000
    if (age < 60) return loc["MapScreen.updatedJustNow"] || "Just now"
    if (age < 3600) {
      const mins = Math.round(age / 60)
      return (loc["MapScreen.updatedMinutes"] || "Updated {count}m ago").replace("{count}", String(mins))
    }
    if (age < 86400) {
      const hrs = Math.round(age / 3600)
      return (loc["MapScreen.updatedHours"] || "Updated {count}h ago").replace("{count}", String(hrs))
    }
    const days = Math.round(age / 86400)
    return (loc["MapScreen.updatedDays"] || "Updated {count}d ago").replace("{count}", String(days))
  } catch {
    return ""
  }
}

export function MerchantList({ places, userCoords, onSelect, lastSync, localized, lang, hasFilters, onClearFilters }: Props) {
  const sorted = useMemo(() => {
    const withDist = places.map((p) => {
      const dist =
        userCoords && typeof p.lat === "number" && typeof p.lon === "number"
          ? distanceKm(userCoords, { lat: p.lat, lon: p.lon })
          : null
      return { p, dist }
    })
    if (userCoords) {
      return withDist.sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity))
    }
    return withDist.sort((a, b) => {
      const aName = localizedField(a.p, "name", lang) || ""
      const bName = localizedField(b.p, "name", lang) || ""
      return aName.localeCompare(bName)
    })
  }, [places, userCoords, lang])

  if (places.length === 0) {
    return (
      <div className="ml-empty">
        <div className="ml-empty-icon">🔍</div>
        <p className="ml-empty-text">{localized["MapScreen.noMerchants"] || "No merchants found"}</p>
        {hasFilters && (
          <button className="ml-empty-btn" onClick={onClearFilters}>
            {localized["MapScreen.clearFilters"] || "Clear filters"}
          </button>
        )}
      </div>
    )
  }

  const label = freshnessLabel(lastSync, localized)
  const countLabel = (localized["MapScreen.merchantsCount"] || "{count} merchants")
    .replace("{count}", String(sorted.length))

  return (
    <div className="ml-container">
      <div className="ml-header">
        <span className="ml-header-text">{countLabel} · {label}</span>
      </div>
      <ul className="ml-list">
        {sorted.map(({ p, dist }) => {
          const cat = inferCategory(p)
          const status = verificationStatus(p)
          const methods = paymentMethods(p)
          const methodsLabel = methods
            .map((m) => (m === "lightning" ? "⚡" : m === "onchain" ? "₿" : "📡"))
            .join(" ")
          const name = localizedField(p, "name", lang) || `#${p.id}`
          const catLabel = localized[categoryLabelKey(cat)] || cat

          return (
            <li key={p.id} className="ml-row" onClick={() => onSelect(p)}>
              <span className="ml-cat-icon">{CATEGORY_GLYPH[cat]}</span>
              <div className="ml-body">
                <div className="ml-name">{name}</div>
                <div className="ml-meta">
                  {catLabel}{methodsLabel ? ` · ${methodsLabel}` : ""}
                </div>
              </div>
              {dist !== null && (
                <span className="ml-distance">{formatDistance(dist)}</span>
              )}
              <span className={`ml-status-dot ml-status-dot--${status}`} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
