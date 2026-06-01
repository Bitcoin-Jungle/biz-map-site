import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import type { CSSProperties } from "react"
import { Map as MapKitMap, Marker, FeatureVisibility } from "mapkit-react"


import { getLanguage, isFromBJ } from "./utils"
import { localizeText } from "./lang"

import {
  fetchSnapshot,
  inCostaRica,
  inferCategory,
  fetchPlace,
  localized as localizedField,
  DETAIL_FIELDS,
} from "./lib/btcmap"
import { loadCached, syncPlaces, getLastSync } from "./lib/sync"

import { BtcMapPlace, MerchantCategory } from "./types/btcmap"

import { CATEGORY_COLOR, CATEGORY_GLYPH, MERCHANT_CLUSTER_ID } from "./lib/markers"
import { useUserLocation } from "./hooks/useUserLocation"

import { SearchFilterBar } from "./components/SearchFilterBar"
import { MerchantList } from "./components/MerchantList"
import { MerchantDetailSheet } from "./components/MerchantDetailSheet"
import Add from "./components/Add"
import Report from "./components/Report"
import Verify from "./components/Verify"

import "./App.css"

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_REGION = {
  centerLatitude: 9.1549238,
  centerLongitude: -83.7570566,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlaceState {
  id: number
  lat: number
  lon: number
  icon?: string
  category: MerchantCategory
  detail?: BtcMapPlace
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useWindowSize = (): [number, number] => {
  const [size, setSize] = useState<[number, number]>([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener("resize", updateSize)
    updateSize()
    return () => window.removeEventListener("resize", updateSize)
  }, [])
  return size
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [width] = useWindowSize()
  const [token, setToken] = useState("")
  // region is read for titleVisibility density heuristic; setRegion driven by onRegionChangeEnd
  const [region, setRegion] = useState(INITIAL_REGION)

  // All CR pins keyed by id for O(1) merge/lookup
  const [places, setPlaces] = useState<globalThis.Map<number, PlaceState>>(new globalThis.Map())
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)

  // View state: map vs list
  const [view, setView] = useState<"map" | "list">("map")

  // Search + filter state
  const [query, setQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<MerchantCategory>>(new Set())

  // Selected/focused state
  const [selectedPlace, setSelectedPlace] = useState<BtcMapPlace | null>(null)
  const [focusedId, setFocusedId] = useState<number | null>(null)

  // F3: modal state
  const [addPinToMap, setAddPinToMap] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPinCoordinates, setNewPinCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [reportPlace, setReportPlace] = useState<BtcMapPlace | null>(null)
  const [verifyPlace, setVerifyPlace] = useState<BtcMapPlace | null>(null)

  // Map ref for programmatic pan/zoom (mapkit.Map native instance, typed as any to avoid missing global declarations)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)

  // Floating control card: measure its real height so the list view can clear it
  // exactly (height varies by breakpoint and whether the BJ brand row is shown).
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerBottom, setHeaderBottom] = useState(0)

  const lang = getLanguage()
  const localized = localizeText(lang)

  const { coords: userCoords, status: locationStatus, request: requestLocation } = useUserLocation()

  // ── Track control-card bottom edge → list clearance ──────────────────────
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return
    const measure = () => setHeaderBottom(Math.round(el.getBoundingClientRect().bottom))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  // ── Token fetch ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/token")
      .then((r) => r.text())
      .then(setToken)
      .catch(console.error)
  }, [])

  // ── Snapshot → instant first paint ────────────────────────────────────────

  useEffect(() => {
    fetchSnapshot()
      .then((pins) => {
        const crPins = pins.filter(
          (p): p is typeof p & { lat: number; lon: number } =>
            typeof p.lat === "number" &&
            typeof p.lon === "number" &&
            inCostaRica({ id: p.id, lat: p.lat, lon: p.lon }),
        )
        setPlaces((prev) => {
          const next = new globalThis.Map(prev)
          for (const pin of crPins) {
            if (!next.has(pin.id)) {
              next.set(pin.id, {
                id: pin.id,
                lat: pin.lat,
                lon: pin.lon,
                icon: pin.icon ?? undefined,
                category: inferCategory({ id: pin.id, icon: pin.icon ?? undefined }),
              })
            }
          }
          return next
        })
      })
      .catch(console.error)
  }, [])

  // ── Background sync ────────────────────────────────────────────────────────

  const mergePlaceBatch = useCallback((batch: BtcMapPlace[]) => {
    setPlaces((prev) => {
      const next = new globalThis.Map(prev)
      for (const p of batch) {
        if (typeof p.lat !== "number" || typeof p.lon !== "number") continue
        const existing = next.get(p.id)
        const category = inferCategory(p)
        next.set(p.id, {
          id: p.id,
          lat: p.lat,
          lon: p.lon,
          icon: p.icon ?? existing?.icon,
          category,
          detail: p,
        })
      }
      return next
    })
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => {
      loadCached()
        .then((cached) => {
          if (cached.length > 0) {
            mergePlaceBatch(cached)
          }
          return syncPlaces()
        })
        .then((fresh) => {
          mergePlaceBatch(fresh)
          setLoading(false)
          return getLastSync()
        })
        .then((sync) => setLastSync(sync))
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }, 0)
    return () => clearTimeout(handle)
  }, [mergePlaceBatch])

  // ── Derived: full place list + filtered list ───────────────────────────────

  const fullPlaces: BtcMapPlace[] = Array.from(places.values())
    .filter((p) => !!p.detail)
    .map((p) => p.detail as BtcMapPlace)

  const filtered: BtcMapPlace[] = fullPlaces.filter((p) => {
    if (selectedCategories.size > 0 && !selectedCategories.has(inferCategory(p))) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    const name = localizedField(p, "name", lang)?.toLowerCase() || ""
    const desc = localizedField(p, "description", lang)?.toLowerCase() || ""
    const addr = p.address?.toLowerCase() || ""
    return name.includes(q) || desc.includes(q) || addr.includes(q)
  })

  // Map points: if focused, show only focused; if full data loaded, use filtered; else snapshot pins
  const pinArray = Array.from(places.values())
  const hasFullData = fullPlaces.length > 0

  const mapPoints: PlaceState[] = (() => {
    if (focusedId !== null) {
      const pin = places.get(focusedId)
      return pin ? [pin] : []
    }
    if (hasFullData) {
      const filteredIds = new Set(filtered.map((p) => p.id))
      return pinArray.filter((p) => filteredIds.has(p.id))
    }
    return pinArray
  })()

  // Focused place for the banner
  const focusedPlace = focusedId !== null ? places.get(focusedId) : undefined

  // ── Selection helpers ──────────────────────────────────────────────────────

  const selectPin = useCallback(
    (id: number) => {
      const existing = places.get(id)
      if (!existing?.detail) {
        fetchPlace(id, DETAIL_FIELDS)
          .then((full) => {
            setPlaces((prev) => {
              const next = new globalThis.Map(prev)
              const pin = next.get(id)
              if (pin) next.set(id, { ...pin, detail: full })
              return next
            })
            setSelectedPlace(full)
          })
          .catch(console.error)
      } else {
        setSelectedPlace(existing.detail)
      }
    },
    [places],
  )

  // ── Clear filters ──────────────────────────────────────────────────────────

  const clearFilters = () => {
    setQuery("")
    setSelectedCategories(new Set())
    setFocusedId(null)
  }

  const onQueryChange = (v: string) => {
    setQuery(v)
    if (focusedId != null) setFocusedId(null)
  }

  const onToggleCategory = (c: MerchantCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
    if (focusedId != null) setFocusedId(null)
  }

  // ── Navigation helper ──────────────────────────────────────────────────────

  const navigateTo = (url: string) => {
    if (isFromBJ()) {
      navigator.clipboard.writeText(url)
      alert(localized.pasted)
      return
    }
    window.open(url, "_blank")
  }

  // ── Programmatic map pan/zoom ──────────────────────────────────────────────

  const animateToCoords = useCallback((lat: number, lon: number, delta: number) => {
    const m = mapRef.current
    if (!m) return
    try {
      // mapkit is a global injected by MapKit JS. Access via window to avoid TS
      // namespace errors (no bundled .d.ts for the global mapkit namespace).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mk = (window as any).mapkit
      if (!mk) return
      const center = new mk.Coordinate(lat, lon)
      const span = new mk.CoordinateSpan(delta, delta)
      const region = new mk.CoordinateRegion(center, span)
      m.setRegionAnimated(region)
    } catch {
      // mapkit may not be fully loaded yet; silently ignore
    }
  }, [])

  // ── View on map (from list) ───────────────────────────────────────────────

  const onViewOnMap = (p: BtcMapPlace) => {
    setSelectedPlace(null)
    setFocusedId(p.id)
    setView("map")
    if (typeof p.lat === "number" && typeof p.lon === "number") {
      // setTimeout gives React a frame to switch to map view before animating
      setTimeout(() => animateToCoords(p.lat as number, p.lon as number, 0.01), 100)
    }
  }

  // ── Find me ────────────────────────────────────────────────────────────────

  const onFindMe = () => {
    if (locationStatus === "granted" && userCoords) {
      animateToCoords(userCoords.lat, userCoords.lon, 0.05)
    } else {
      requestLocation()
    }
  }

  // Center map on user when location first granted
  useEffect(() => {
    if (locationStatus === "granted" && userCoords) {
      animateToCoords(userCoords.lat, userCoords.lon, 0.05)
    }
  }, [locationStatus, userCoords, animateToCoords])

  // ── F3: Modal handlers ────────────────────────────────────────────────────

  const handleReport = (place: BtcMapPlace) => setReportPlace(place)
  const handleVerify = (place: BtcMapPlace) => setVerifyPlace(place)

  const handleAddToMap = () => setAddPinToMap(true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapClick = (obj: any) => {
    if (addPinToMap) {
      const coords = obj.toCoordinates() as { latitude: number; longitude: number }
      setNewPinCoordinates(coords)
      setShowAddModal(true)
    }
  }

  const handleAddCancel = () => {
    setShowAddModal(false)
    setAddPinToMap(false)
    setNewPinCoordinates(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isMobile = width <= 700

  return (
    <div
      id="App"
      className={isFromBJ() ? "mobileApp" : ""}
      style={headerBottom ? ({ "--header-bottom": `${headerBottom}px` } as CSSProperties) : undefined}
    >
      {/* ── Header ── */}
      <div id="header" className="header-new" ref={headerRef}>
        {!isFromBJ() && (
          <header className="header-brand">
            <a href="https://bitcoinjungle.app" target="_blank" rel="noreferrer">
              <img
                src="https://storage.googleapis.com/bitcoin-jungle-branding/logo/web/logo-web.png"
                alt="Bitcoin Jungle"
              />
              <span>{localized.title}</span>
            </a>
          </header>
        )}

        {/* Search + filter bar */}
        <SearchFilterBar
          query={query}
          onQueryChange={onQueryChange}
          selectedCategories={selectedCategories}
          onToggleCategory={onToggleCategory}
          onClearFilters={clearFilters}
          localized={localized}
        />

        {/* Map / List toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${view === "map" ? " view-toggle-btn--active" : ""}`}
            onClick={() => setView("map")}
          >
            🗺 {localized["MapScreen.viewMap"] || "Map"}
          </button>
          <button
            className={`view-toggle-btn${view === "list" ? " view-toggle-btn--active" : ""}`}
            onClick={() => {
              setFocusedId(null)
              setView("list")
            }}
          >
            ☰ {localized["MapScreen.viewList"] || "List"}
          </button>
        </div>
      </div>

      {/* ── Add-pin prompt banner ── */}
      {addPinToMap && (
        <div id="topHeader">
          <p className="text-lg font-bold">{localized.addPrompt}</p>
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ width: "100vw", height: "100vh" }}>
        {/* MAP VIEW */}
        {view === "map" && token.length > 0 && (
          <>
            <MapKitMap
              ref={mapRef}
              token={token}
              showsPointsOfInterest={false}
              onRegionChangeEnd={setRegion}
              initialRegion={INITIAL_REGION}
              onClick={handleMapClick}
              showsMapTypeControl={false}
              showsZoomControl={!isMobile}
              showsUserLocation={locationStatus === "granted"}
            >
              {mapPoints.map((pin) => (
                <Marker
                  key={pin.id}
                  latitude={pin.lat}
                  longitude={pin.lon}
                  title={
                    pin.detail
                      ? localizedField(pin.detail, "name", lang) || String(pin.id)
                      : String(pin.id)
                  }
                  titleVisibility={
                    region.latitudeDelta < 0.05
                      ? FeatureVisibility.Adaptive
                      : FeatureVisibility.Hidden
                  }
                  glyphText={CATEGORY_GLYPH[pin.category]}
                  color={CATEGORY_COLOR[pin.category]}
                  clusteringIdentifier={MERCHANT_CLUSTER_ID}
                  onSelect={() => selectPin(pin.id)}
                  onDeselect={() => setSelectedPlace(null)}
                />
              ))}

              {/* New-pin coordinate picker marker */}
              {newPinCoordinates && (
                <Marker
                  key="new-pin"
                  latitude={newPinCoordinates.latitude}
                  longitude={newPinCoordinates.longitude}
                  title={localized.addPinTitle}
                  color="blue"
                />
              )}
            </MapKitMap>

            {/* Focus banner */}
            {focusedPlace && (
              <div className="focus-banner">
                <span className="focus-banner-text">
                  {focusedPlace.detail
                    ? localizedField(focusedPlace.detail, "name", lang) || String(focusedId)
                    : String(focusedId)}
                </span>
                <button className="focus-banner-btn" onClick={() => setFocusedId(null)}>
                  {localized["MapScreen.showAll"] || "Show all"}
                </button>
              </div>
            )}

            {/* Loading overlay */}
            {loading && fullPlaces.length === 0 && (
              <div className="loading-overlay">
                <span className="loading-spinner" />
                <span className="loading-text">
                  {localized["MapScreen.loadingMerchants"] || "Loading merchants…"}
                </span>
              </div>
            )}

            {/* FABs */}
            <div className="fab-container">
              <button className="fab" onClick={handleAddToMap} title={localized.addToMap}>
                ＋
              </button>
              <button
                className="fab fab--primary"
                onClick={onFindMe}
                title={localized["MapScreen.findMe"] || "Find me"}
              >
                📍
              </button>
            </div>
          </>
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="list-view-container">
            <MerchantList
              places={filtered.length > 0 || query || selectedCategories.size > 0 ? filtered : fullPlaces}
              userCoords={userCoords}
              onSelect={(p) => setSelectedPlace(p)}
              lastSync={lastSync}
              localized={localized}
              lang={lang}
              hasFilters={query.length > 0 || selectedCategories.size > 0}
              onClearFilters={clearFilters}
            />
          </div>
        )}
      </main>

      {/* ── Detail sheet (both views) ── */}
      <MerchantDetailSheet
        place={selectedPlace}
        lang={lang}
        localized={localized}
        currentView={view}
        onClose={() => setSelectedPlace(null)}
        navigateTo={navigateTo}
        onReport={handleReport}
        onVerify={handleVerify}
        onViewOnMap={onViewOnMap}
      />

      {/* ── Footer: app-download CTA (Add handled by the “＋” FAB) ── */}
      {!isFromBJ() && (
        <div id="footer">
          <footer>
            <a href="https://apps.apple.com/us/app/bitcoin-jungle/id1600313979">
              <img
                src="https://pay.bitcoinjungle.app/apple-app-store.png"
                alt="Download on the App Store"
              />
            </a>
            <a href="https://play.google.com/store/apps/details?id=app.bitcoinjungle.mobile">
              <img
                src="https://pay.bitcoinjungle.app/google-play-badge.png"
                alt="Get it on Google Play"
              />
            </a>
          </footer>
        </div>
      )}

      {/* ── F3 Modals ── */}
      {showAddModal && newPinCoordinates && (
        <Add
          localized={localized}
          newPinCoordinates={newPinCoordinates}
          handleCancel={handleAddCancel}
        />
      )}
      {reportPlace && (
        <Report
          localized={localized}
          lang={lang}
          place={reportPlace}
          handleCancel={() => setReportPlace(null)}
        />
      )}
      {verifyPlace && (
        <Verify
          localized={localized}
          lang={lang}
          place={verifyPlace}
          handleCancel={() => setVerifyPlace(null)}
        />
      )}
    </div>
  )
}

export default App
