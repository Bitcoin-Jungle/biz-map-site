const es: Record<string, string> = {
  title: "Mapa de Negocios",
  addToMap: "Agregar al Mapa",
  addPin: "Agregar un pin",
  addPinSub: "Agrega un negocio que acepta Bitcoin en Costa Rica.",
  pinLocation: "Ubicación del pin",
  reportSub: "Cuéntanos qué está mal para corregir el mapa.",
  verifySub: "Ayuda a mantener este negocio actualizado.",
  submit: "Enviar",
  submitting: "Enviando…",
  done: "Listo",
  tryAgain: "Reintentar",
  errorTitle: "Algo salió mal",
  successTitle: "¡Enviado!",
  addPrompt: "Seleccione la ubicación en el mapa para agregar negocios",
  uncategorized: "Sin categoría",
  addPinTitle: "Añadir negocio aquí",
  categories: "Categorías",
  phone: "Teléfono",
  website: "Página web",
  description: "Descripción",
  report: "Reportar",
  bizName: "Nombre del negocio",
  bizPhone: "Teléfono empresarial",
  bizWebsite: "Sitio web comercial",
  optional: "Opcional",
  cancel: "Cancelar",
  reportDescription: "Descripción del problema",
  search: "Buscar",
  close: "Cerrar",
  pasted:
    "Hemos pegado el enlace a su portapapeles. Utilice su navegador web y pegue el enlace.",

  // F3: Verify modal
  verify: "Verificar",
  verifyQuestion: "¿Este negocio todavía acepta Bitcoin?",
  verifyYes: "Sí, todavía acepta",
  verifyNo: "No / la información está desactualizada",
  verifyOutdatedPrompt: "¿Qué está mal o desactualizado?",

  // F3: Directions
  directions: "Cómo llegar",

  // F3: Submission feedback
  submittedForReview:
    "¡Gracias! Tu envío fue recibido y será revisado por un administrador antes de aparecer en el mapa.",
  reportThanks: "Gracias por el reporte. Lo investigaremos y tomaremos acción pronto.",

  // Category labels — keys match categoryLabelKey() output
  "MapScreen.categoryRestaurant": "Restaurante",
  "MapScreen.categoryCafe": "Café",
  "MapScreen.categoryHotel": "Hotel",
  "MapScreen.categoryRetail": "Comercio",
  "MapScreen.categoryHealth": "Salud",
  "MapScreen.categoryTourism": "Turismo",
  "MapScreen.categoryServices": "Servicios",
  "MapScreen.categoryTransport": "Transporte",
  "MapScreen.categoryOther": "Otro",

  // Payment method labels
  "Payment.lightning": "Lightning",
  "Payment.onchain": "En cadena",
  "Payment.nfc": "Pago sin contacto",

  // Verification status labels
  "Verification.fresh": "Verificado recientemente",
  "Verification.stale": "Verificado hace más de un año",
  "Verification.unverified": "Sin verificar",

  // Map/List toggle
  "MapScreen.viewMap": "Mapa",
  "MapScreen.viewList": "Lista",

  // Search/filter bar
  "MapScreen.searchPlaceholder": "Buscar negocios…",
  "MapScreen.clearFilters": "Limpiar filtros",

  // Merchant list
  "MapScreen.merchantsCount": "{count} negocios",
  "MapScreen.updatedJustNow": "Actualizado ahora mismo",
  "MapScreen.updatedMinutes": "Actualizado hace {count}m",
  "MapScreen.updatedHours": "Actualizado hace {count}h",
  "MapScreen.updatedDays": "Actualizado hace {count}d",
  "MapScreen.loading": "Cargando…",
  "MapScreen.noMerchants": "No se encontraron negocios",

  // Detail sheet verification strings
  "MapScreen.verifiedOn": "Verificado {date}",
  "MapScreen.lastVerifiedStale": "Última verificación {date}",
  "MapScreen.notRecentlyVerified": "No verificado recientemente",

  // Detail sheet CTAs
  "MapScreen.getDirections": "Cómo llegar",
  "MapScreen.viewOnMap": "Ver en el mapa",

  // Focus banner
  "MapScreen.showAll": "Ver todos",

  // Loading overlay
  "MapScreen.loadingMerchants": "Cargando negocios…",

  // Find me button
  "MapScreen.findMe": "Ubicarme",
}

export default es
