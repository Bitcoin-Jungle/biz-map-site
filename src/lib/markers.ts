import { MerchantCategory } from "../types/btcmap"

/** Category → emoji glyph shown in the MapKit marker balloon */
export const CATEGORY_GLYPH: Record<MerchantCategory, string> = {
  restaurant: "🍴",
  cafe: "☕",
  hotel: "🛏",
  retail: "🛍",
  tourism: "🧭",
  health: "⚕️",
  services: "💼",
  transport: "🚗",
  other: "📍",
}

/**
 * Category → marker balloon color (hex). A cohesive "tropical" palette: distinct
 * enough to read at a glance, harmonized so the map doesn't look like confetti.
 */
export const CATEGORY_COLOR: Record<MerchantCategory, string> = {
  restaurant: "#E8643C", // warm coral
  cafe: "#9C6644",       // coffee
  hotel: "#2E7DA1",      // lagoon
  retail: "#B5567E",     // orchid
  tourism: "#1F9E7A",    // teal-green
  health: "#2BA45A",     // leaf
  services: "#E0922B",   // amber
  transport: "#3B5566",  // slate
  other: "#6B8A7A",      // sage
}

/** A single clustering identifier groups all merchant markers so MapKit clusters them. */
export const MERCHANT_CLUSTER_ID = "btcmap-merchant"
