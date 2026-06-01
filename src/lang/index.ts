import en from "./en"
import es from "./es"

export type LangDict = Record<string, string>

export const localizeText = (lang: string): LangDict => {
  if (lang.indexOf("en") === 0) {
    return en
  }

  if (lang.indexOf("es") === 0) {
    return es
  }

  return en
}

export const localize = (
  localized: LangDict,
  key: string,
  vars?: Record<string, string>,
): string => {
  let output = localized[key] || ""

  if (vars) {
    const varKeys = Object.keys(vars)
    for (let i = varKeys.length - 1; i >= 0; i--) {
      const varKey = varKeys[i]
      const myVar = vars[varKey]
      output = output.replace(`{${varKey}}`, myVar)
    }
  }

  return output
}
