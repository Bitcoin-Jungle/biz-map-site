import { useState } from "react"

import Modal from "./Modal"
import { LangDict } from "../lang"
import { BtcMapPlace } from "../types/btcmap"
import { localized as localizedField } from "../lib/btcmap"

interface ReportProps {
  localized: LangDict
  lang: string
  place: BtcMapPlace
  handleCancel: () => void
}

type Status = "idle" | "submitting" | "success" | "error"

function Report({ localized, lang, place, handleCancel }: ReportProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [description, setDescription] = useState("")

  const loading = status === "submitting"
  const placeName = localizedField(place, "name", lang) || String(place.id)

  const handleSubmit = async () => {
    if (loading) return

    setStatus("submitting")
    setErrorMsg("")

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_place_id: place.id,
          description: description,
        }),
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
        title={localized.report}
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
          <p className="bjm-result-text">{localized.reportThanks}</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={localized.report}
      subtitle={localized.reportSub}
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
            className="ds-btn ds-btn--danger"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading && <span className="bjm-spinner" style={{ borderColor: "rgba(224,83,58,0.25)", borderTopColor: "var(--bad)" }} />}
            {loading ? localized.submitting : localized.report}
          </button>
        </>
      }
    >
      {status === "error" && errorMsg && <div className="bjm-error">{errorMsg}</div>}

      <div className="bjm-field">
        <label className="bjm-label">{localized.bizName}</label>
        <input className="bjm-input" value={placeName} disabled />
      </div>

      <div className="bjm-field">
        <label className="bjm-label" htmlFor="report-desc">{localized.reportDescription}</label>
        <textarea
          id="report-desc"
          className="bjm-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
        />
      </div>
    </Modal>
  )
}

export default Report
