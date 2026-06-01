import { BtcMapPlace, MerchantCategory, PaymentMethod, PlacePin } from "../types/btcmap"

const BASE = "https://api.btcmap.org/v4"

// CDN-cached static snapshot of all places (id, lat, lon, icon).
// ~2MB, sub-second, served from an edge node near the user. Used for an
// instant first paint of the map on a cold start before full fields load.
// NOTE: the live snapshot does NOT include `comments`; PlacePin.comments is
// optional to stay type-compatible if the API adds it later.
const SNAPSHOT_URL = "https://cdn.static.btcmap.org/api/v4/places.json"

// Fields fetched for full place detail. Mirrors the mobile PLACE_FIELDS list
// plus `osm_id` and `deleted_at` which sync.ts needs for eviction.
export const DETAIL_FIELDS: string[] = [
  "id",
  "osm_id",
  "lat",
  "lon",
  "name",
  "icon",
  "address",
  "description",
  "opening_hours",
  "phone",
  "website",
  "email",
  "twitter",
  "facebook",
  "instagram",
  "telegram",
  "verified_at",
  "created_at",
  "updated_at",
  "deleted_at",
  "image",
  "osm:amenity",
  "osm:shop",
  "osm:tourism",
  "osm:healthcare",
  "osm:office",
  "osm:sport",
  "osm:cuisine",
  "osm:payment:lightning",
  "osm:payment:onchain",
  "osm:payment:lightning_contactless",
  "osm:description:en",
  "osm:description:es",
  "osm:name:en",
  "osm:name:es",
  "osm:currency:XBT",
]

// ─── Core fetch helpers (ported verbatim from mobile utils/btcmap.ts) ─────────

export async function fetchPlaces(updatedSince?: string): Promise<BtcMapPlace[]> {
  const params = new URLSearchParams({ fields: DETAIL_FIELDS.join(",") })
  if (updatedSince) {
    params.set("updated_since", updatedSince)
    params.set("include_deleted", "true")
  }
  const res = await fetch(`${BASE}/places?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`BTC Map /v4/places returned ${res.status}`)
  }
  return res.json() as Promise<BtcMapPlace[]>
}

// Fetch the lightweight CDN snapshot of all pins. Filter to CR with inCostaRica.
// Live API returns only id, lat, lon, icon — no comments.
export async function fetchSnapshot(): Promise<Array<Pick<BtcMapPlace, "id" | "lat" | "lon" | "icon" | "comments">>> {
  const res = await fetch(SNAPSHOT_URL)
  if (!res.ok) {
    throw new Error(`BTC Map snapshot returned ${res.status}`)
  }
  return res.json() as Promise<PlacePin[]>
}

// ─── Web-only helpers ─────────────────────────────────────────────────────────

// Fetch a single place by numeric id or OSM id string.
// Use DETAIL_FIELDS (or a subset) as the `fields` argument.
// Used to enrich the detail panel on pin tap without a full sync.
export async function fetchPlace(
  id: number | string,
  fields: string[],
): Promise<BtcMapPlace> {
  const params = new URLSearchParams({ fields: fields.join(",") })
  const res = await fetch(`${BASE}/places/${id}?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`BTC Map /v4/places/${id} returned ${res.status}`)
  }
  return res.json() as Promise<BtcMapPlace>
}

// ─── Geography ───────────────────────────────────────────────────────────────

// Costa Rica bounding box (rough country-wide).
export const CR_BBOX = {
  north: 11.22,
  south: 8.04,
  east: -82.55,
  west: -85.95,
}

export function inCostaRica(p: BtcMapPlace): boolean {
  if (typeof p.lat !== "number" || typeof p.lon !== "number") return false
  return (
    p.lat >= CR_BBOX.south &&
    p.lat <= CR_BBOX.north &&
    p.lon >= CR_BBOX.west &&
    p.lon <= CR_BBOX.east
  )
}

// ─── Category inference ───────────────────────────────────────────────────────

// Map a BTC Map place to a logical category for filtering UI.
// Uses the explicit BTC Map `icon` first, falls back to OSM tags.
export function inferCategory(p: BtcMapPlace): MerchantCategory {
  const icon = p.icon?.toLowerCase()
  if (icon === "restaurant" || p["osm:amenity"] === "restaurant") return "restaurant"
  if (icon === "cafe" || p["osm:amenity"] === "cafe") return "cafe"
  if (icon === "hotel" || p["osm:tourism"] === "hotel") return "hotel"
  if (p["osm:tourism"]) return "tourism"
  if (p["osm:healthcare"]) return "health"
  if (p["osm:shop"]) return "retail"
  if (p["osm:office"]) return "services"
  if (p["osm:sport"]) return "tourism"
  return "other"
}

// i18n key for a category's display label. Shared by the filter chips and the
// list-row meta so both render the same localized name.
export function categoryLabelKey(c: MerchantCategory): string {
  return `MapScreen.category${c.charAt(0).toUpperCase()}${c.slice(1)}`
}

// Map BTC Map's `icon` field (Material Symbols names) to an ionicon name for
// map markers. We use ionicons (not the raw Material names) because the app
// already ships that font and many Material Symbols names aren't in the bundled
// classic MaterialIcons set. Unknown icons fall back to a generic pin.
const ICON_TO_IONICON: Record<string, string> = {
  restaurant: "restaurant", lunch_dining: "restaurant", local_pizza: "restaurant",
  bakery_dining: "restaurant", tapas: "restaurant", icecream: "ice-cream",
  local_cafe: "cafe", coffee: "cafe",
  hotel: "bed", chalet: "bed", camping: "bonfire", luggage: "bed",
  storefront: "storefront", local_grocery_store: "storefront", card_giftcard: "gift",
  liquor: "wine", diamond: "diamond",
  medical_services: "medkit", local_pharmacy: "medkit", dentistry: "medkit",
  fitness_center: "barbell", spa: "flower", sauna: "flame", sports: "football",
  sports_score: "football", sports_bar: "beer", sports_martial_arts: "fitness",
  school: "school", science: "flask", business: "briefcase", group: "briefcase",
  factory: "briefcase", warehouse: "cube", office: "briefcase",
  palette: "color-palette", design_services: "color-palette", colorize: "color-palette",
  architecture: "construct", photo_camera: "camera", content_cut: "cut",
  local_florist: "flower", pets: "paw",
  local_bar: "beer", local_atm: "cash", account_balance: "cash",
  currency_exchange: "cash", balance: "cash",
  home: "home", chair: "home", hardware: "hammer", construction: "construct",
  directions_car: "car", car_repair: "car", local_car_wash: "car",
  local_taxi: "car", local_parking: "car", two_wheeler: "bicycle", pedal_bike: "bicycle",
  tour: "compass", beach_access: "umbrella", surfing: "compass", visibility: "eye",
  computer: "laptop", smartphone: "phone-portrait", local_printshop: "print",
  music_note: "musical-notes", mic: "mic", casino: "dice",
  church: "business", directions_boat: "boat", volunteer_activism: "heart",
  vaping_rooms: "cloud", bedroom_baby: "happy", info_outline: "information-circle",
}

export function markerIonicon(icon: string | undefined): string {
  if (!icon) return "location"
  return ICON_TO_IONICON[icon] ?? "location"
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export function paymentMethods(p: BtcMapPlace): PaymentMethod[] {
  const out: PaymentMethod[] = []
  if (p["osm:payment:lightning"] === "yes") out.push("lightning")
  if (p["osm:payment:onchain"] === "yes") out.push("onchain")
  if (p["osm:payment:lightning_contactless"] === "yes") out.push("nfc")
  return out
}

// ─── Localization ─────────────────────────────────────────────────────────────

// Pick the best-localized display string from a place. Prefers
// osm:<field>:<lang>, falls back to the top-level field, then to English.
export function localized(
  p: BtcMapPlace,
  field: "name" | "description",
  lang: string | undefined,
): string | undefined {
  const code = (lang || "en").slice(0, 2).toLowerCase()
  const localizedKey = `osm:${field}:${code}` as `osm:${string}`
  return (p[localizedKey] as string | undefined) || p[field] || p[`osm:${field}:en` as `osm:${string}`]
}

// ─── Verification ─────────────────────────────────────────────────────────────

// Verification freshness from `verified_at`.
//  - "fresh": verified within the last 12 months
//  - "stale": verified between 12 and 24 months ago
//  - "unverified": verified >24 months ago, or never
export function verificationStatus(p: BtcMapPlace): "fresh" | "stale" | "unverified" {
  if (!p.verified_at) return "unverified"
  const verified = Date.parse(p.verified_at)
  if (isNaN(verified)) return "unverified"
  const ageMs = Date.now() - verified
  const months = ageMs / (1000 * 60 * 60 * 24 * 30.44)
  if (months < 12) return "fresh"
  if (months < 24) return "stale"
  return "unverified"
}

// ─── Geo math ─────────────────────────────────────────────────────────────────

// Haversine distance in km. Cheap inline impl.
export function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

// ─── Phone formatting ─────────────────────────────────────────────────────────

// Normalize the messy OSM `phone` tag for display. OSM values are free-form:
// "+506 7148-1874", "50688889999", "+50 6 8888 9999", "+1-786-351-8388",
// "+506 2231-3996 & 5664" (multiple numbers). We show the first number,
// formatted as "+506 XXXX XXXX" for Costa Rica, lightly cleaned otherwise.
export function formatPhone(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const first = raw.split(/[,;/&]| y | and /i)[0].trim()
  if (!first) return undefined
  const hadPlus = first.startsWith("+")
  const digits = first.replace(/\D/g, "")
  // Costa Rica: country code 506 + 8 national digits.
  if (digits.startsWith("506") && digits.length === 11) {
    const n = digits.slice(3)
    return `+506 ${n.slice(0, 4)} ${n.slice(4)}`
  }
  // Bare 8-digit national number — assume Costa Rica.
  if (!hadPlus && digits.length === 8) {
    return `+506 ${digits.slice(0, 4)} ${digits.slice(4)}`
  }
  // Otherwise keep the user's value, collapsing stray whitespace.
  return first.replace(/\s+/g, " ")
}

// A `tel:` href for the first number in a free-form phone tag.
export function phoneTelHref(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const first = raw.split(/[,;/&]| y | and /i)[0].trim()
  const cleaned = first.replace(/[^\d+]/g, "")
  return cleaned ? `tel:${cleaned}` : undefined
}

// ─── Navigation ───────────────────────────────────────────────────────────────

// Build a platform-appropriate directions URL.
// Web callers should pass "web" to get a Google Maps link.
export function directionsUrl(
  lat: number,
  lon: number,
  name: string | undefined,
  platform: "ios" | "android" | "web",
): string {
  if (platform === "ios") {
    return `maps://?daddr=${lat},${lon}`
  }
  if (platform === "web") {
    // Google Maps "directions to a point" deep link. (Don't stuff the name into
    // query_place_id — that field expects a Google Place ID, not a name.)
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
  }
  const label = name ? `(${encodeURIComponent(name)})` : ""
  return `geo:0,0?q=${lat},${lon}${label}`
}
