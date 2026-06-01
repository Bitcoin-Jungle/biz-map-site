import { useState } from "react"

import Modal from "./Modal"
import { LangDict } from "../lang"
import { BtcMapPlace } from "../types/btcmap"
import { localized as localizedField } from "../lib/btcmap"

// ownership: backend resolves; until re-import this degrades to admin notification.
// Most CR pins were imported by a non-BJ OSM user. BtcMapPlace has no origin/import
// field we can reliably read, so all verify submissions are queued for BJ admin review
// regardless of apparent ownership. The backend decides what to do with each submission.

interface VerifyProps {
  localized: LangDict
  lang: string
  place: BtcMapPlace
  handleCancel: () => void
}

type Status = "idle" | "submitting" | "success" | "error"

function Verify({ localized, lang, place, handleCancel }: VerifyProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  // null = not yet answered, true = still accepts, false = outdated/wrong
  const [currentAnswer, setCurrentAnswer] = useState<boolean | null>(null)
  const [outdatedText, setOutdatedText] = useState("")

  const loading = status === "submitting"
  const placeName = localizedField(place, "name", lang) || String(place.id)

  const handleSubmit = async () => {
    if (loading || currentAnswer === null) return

    setStatus("submitting")
    setErrorMsg("")

    try {
      const body: {
        target_place_id: number
        current: boolean
        outdated?: string
      } = {
        target_place_id: place.id,
        current: currentAnswer,
      }

      if (!currentAnswer) {
        body.outdated = outdatedText.trim() || undefined
      }

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrorMsg(responseData.error || localized.errorTitle)
        setStatus("error")
        return
      }
      setStatus("success")
    } catch (e) {
      setErrorMsg(String(e))
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <Modal
        title={localized.verify}
        onClose={handleCancel}
        actions={
          <button className="ds-btn ds-btn--primary" onClick={handleCancel}>
            {localized.done}
          </button>
        }
      >
        <div className="bjm-result">
          <div className="bjm-result-icon bjm-result-icon--ok">✓</div>
          <div className="bjm-result-title">{localized.successTitle}</div>
          <p className="bjm-result-text">{localized.submittedForReview}</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={localized.verify}
      subtitle={placeName}
      onClose={handleCancel}
      actions={
        <>
          <button
            className="ds-btn ds-btn--secondary"
            disabled={loading}
            onClick={handleCancel}
          >
            {localized.cancel}
          </button>
          <button
            className="ds-btn ds-btn--primary"
            disabled={loading || currentAnswer === null}
            onClick={handleSubmit}
          >
            {loading && <span className="bjm-spinner" />}
            {loading ? localized.submitting : localized.verify}
          </button>
        </>
      }
    >
      {status === "error" && errorMsg && <div className="bjm-error">{errorMsg}</div>}

      <p className="bjm-result-text" style={{ maxWidth: "none", color: "var(--bj-ink)", fontWeight: 500 }}>
        {localized.verifyQuestion}
      </p>

      <div className="bjm-choice">
        <button
          type="button"
          disabled={loading}
          onClick={() => setCurrentAnswer(true)}
          className={`bjm-choice-btn${currentAnswer === true ? " bjm-choice-btn--yes-on" : ""}`}
        >
          {localized.verifyYes}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setCurrentAnswer(false)}
          className={`bjm-choice-btn${currentAnswer === false ? " bjm-choice-btn--no-on" : ""}`}
        >
          {localized.verifyNo}
        </button>
      </div>

      {currentAnswer === false && (
        <div className="bjm-field">
          <label className="bjm-label" htmlFor="verify-outdated">{localized.verifyOutdatedPrompt}</label>
          <textarea
            id="verify-outdated"
            className="bjm-textarea"
            value={outdatedText}
            onChange={(e) => setOutdatedText(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
      )}
    </Modal>
  )
}

export default Verify
