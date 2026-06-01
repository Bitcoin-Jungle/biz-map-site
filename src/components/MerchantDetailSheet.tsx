import { BtcMapPlace } from "../types/btcmap"
import {
  categoryLabelKey,
  directionsUrl,
  formatPhone,
  inferCategory,
  localized as localizedField,
  paymentMethods,
  phoneTelHref,
  verificationStatus,
} from "../lib/btcmap"
import { LangDict } from "../lang"

interface Props {
  place: BtcMapPlace | null
  lang: string
  localized: LangDict
  currentView: "map" | "list"
  onClose: () => void
  navigateTo: (url: string) => void
  onReport: (p: BtcMapPlace) => void
  onVerify: (p: BtcMapPlace) => void
  onViewOnMap: (p: BtcMapPlace) => void
}

function formatVerifiedAt(iso: string | undefined): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" })
  } catch {
    return ""
  }
}

export function MerchantDetailSheet({
  place,
  lang,
  localized,
  currentView,
  onClose,
  navigateTo,
  onReport,
  onVerify,
  onViewOnMap,
}: Props) {
  if (!place) return null

  const name = localizedField(place, "name", lang) || `#${place.id}`
  const description = localizedField(place, "description", lang)
  const methods = paymentMethods(place)
  const status = verificationStatus(place)
  const cat = inferCategory(place)
  const catLabel = localized[categoryLabelKey(cat)] || cat
  const lat = place.lat
  const lon = place.lon
  const hasCoords = typeof lat === "number" && typeof lon === "number"

  const verifiedDateStr = formatVerifiedAt(place.verified_at)
  let statusLabel: string
  if (status === "fresh") {
    statusLabel = (localized["MapScreen.verifiedOn"] || "Verified {date}").replace("{date}", verifiedDateStr)
  } else if (status === "stale") {
    statusLabel = (localized["MapScreen.lastVerifiedStale"] || "Last verified {date}").replace("{date}", verifiedDateStr)
  } else {
    statusLabel = localized["MapScreen.notRecentlyVerified"] || "Not recently verified"
  }

  return (
    <div id="details" className="detail-sheet">
      {/* Header */}
      <div className="ds-header">
        <div className="ds-header-text">
          <div className="ds-name">{name}</div>
          {place.address && <div className="ds-address">{place.address}</div>}
        </div>
        <button className="ds-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="ds-body">
        {/* Verification status */}
        <div className="ds-status-row">
          <span className={`ds-status-dot ds-status-dot--${status}`} />
          <span className="ds-status-text">{statusLabel}</span>
        </div>

        {/* Category */}
        <div className="ds-category">{catLabel}</div>

        {/* Payment badges */}
        {methods.length > 0 && (
          <div className="payment-badges ds-badges">
            {methods.map((m) => (
              <span key={m} className={`payment-badge payment-badge--${m}`}>
                {m === "lightning" ? "⚡ Lightning" : m === "onchain" ? "₿ On-chain" : "📡 NFC"}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="ds-description">{description}</p>
        )}

        {/* Phone */}
        {place.phone && (
          <div className="ds-row">
            <span className="ds-row-icon">📞</span>
            <a href={phoneTelHref(place.phone) || `tel:${place.phone}`} className="ds-row-link">
              {formatPhone(place.phone) || place.phone}
            </a>
          </div>
        )}

        {/* Website */}
        {place.website && (
          <div className="ds-row">
            <span className="ds-row-icon">🌐</span>
            <a
              href="#"
              className="ds-row-link"
              onClick={(e) => {
                e.preventDefault()
                navigateTo(place.website!)
              }}
            >
              {place.website.length > 35 ? place.website.substring(0, 35) + "…" : place.website}
            </a>
          </div>
        )}

        {/* Opening hours */}
        {place.opening_hours && (
          <div className="ds-row">
            <span className="ds-row-icon">🕐</span>
            <span className="ds-row-text">{place.opening_hours}</span>
          </div>
        )}

        {/* Primary CTA */}
        <div className="ds-cta-row">
          {currentView === "list" ? (
            <button
              className="ds-btn ds-btn--primary"
              disabled={!hasCoords}
              onClick={() => onViewOnMap(place)}
            >
              🗺 {localized["MapScreen.viewOnMap"] || "View on map"}
            </button>
          ) : (
            <button
              className="ds-btn ds-btn--primary"
              disabled={!hasCoords}
              onClick={() => {
                if (hasCoords) navigateTo(directionsUrl(lat as number, lon as number, name, "web"))
              }}
            >
              🧭 {localized["MapScreen.getDirections"] || "Get directions"}
            </button>
          )}
        </div>

        {/* Secondary CTAs */}
        <div className="ds-cta-row">
          <button
            className="ds-btn ds-btn--secondary"
            onClick={() => onVerify(place)}
          >
            {localized.verify || "Verify"}
          </button>
          <button
            className="ds-btn ds-btn--danger"
            onClick={() => onReport(place)}
          >
            {localized.report || "Report"}
          </button>
        </div>
      </div>
    </div>
  )
}
