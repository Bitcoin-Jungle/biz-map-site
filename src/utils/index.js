export const getLanguage = () => {
  return navigator.language || navigator.userLanguage || 'en-US'
}