export const getLanguage = () => {
  const params = (new URL(document.location)).searchParams;
  const key = params.get("lang");

  if(key && key.length > 0 && key !== "DEFAULT") {
    return key
  }
  
  return navigator.language || navigator.userLanguage || 'en'
}