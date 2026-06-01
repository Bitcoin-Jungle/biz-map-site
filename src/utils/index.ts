export const getLanguage = (): string => {
  const params = new URL(document.location.href).searchParams
  const key = params.get("lang")

  if (key && key.length > 0 && key !== "DEFAULT") {
    return key
  }

  return (navigator as Navigator & { userLanguage?: string }).language ||
    (navigator as Navigator & { userLanguage?: string }).userLanguage ||
    "en"
}

export const isFromBJ = (): boolean => {
  const params = new URL(document.location.href).searchParams
  const key = params.get("fromBJ")

  if (key && key.length > 0) {
    return true
  }

  return false
}
