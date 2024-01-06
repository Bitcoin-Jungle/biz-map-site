export const getLanguage = () => {
  const params = (new URL(document.location)).searchParams;
  const key = params.get("lang");

  if(key && key.length > 0 && key !== "DEFAULT") {
    return key
  }
  
  return navigator.language || navigator.userLanguage || 'en'
}

export const isFromBJ = () => {
  const params = (new URL(document.location)).searchParams;
  const key = params.get("fromBJ");

  if(key && key.length > 0) {
    return true
  }

  return false
}