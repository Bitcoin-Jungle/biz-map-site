import { useState } from "react"

import Modal from "./Modal"
import { LangDict } from "../lang"
import { MerchantCategory } from "../types/btcmap"
import { categoryLabelKey } from "../lib/btcmap"
import { CATEGORY_GLYPH } from "../lib/markers"

const ALL_CATEGORIES: MerchantCategory[] = [
  "restaurant",
  "cafe",
  "hotel",
  "retail",
  "health",
  "tourism",
  "services",
  "transport",
  "other",
]

interface AddProps {
  localized: LangDict
  newPinCoordinates: { latitude: number; longitude: number }
  handleCancel: () => void
}

type Status = "idle" | "submitting" | "success" | "error"

function Add({ localized, newPinCoordinates, handleCancel }: AddProps) {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [name, setName] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<MerchantCategory[]>([])
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [description, setDescription] = useState("")

  const loading = status === "submitting"

  const toggleCategory = (cat: MerchantCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const handleSubmit = async () => {
    if (loading) return
    if (!name.trim()) {
      setErrorMsg(`${localized.bizName} is required`)
      setStatus("error")
      return
    }

    setStatus("submitting")
    setErrorMsg("")

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          coordinates: newPinCoordinates,
          categories: selectedCategories,
          phone: phone.trim() || undefined,
          website: website.trim() || undefined,
          description: description.trim() || undefined,
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

  // ── Success screen ──────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <Modal
        title={localized.addPin}
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

  // ── Form ────────────────────────────────────────────────────────────────
  const lat = newPinCoordinates.latitude.toFixed(5)
  const lon = newPinCoordinates.longitude.toFixed(5)

  return (
    <Modal
      title={localized.addPin}
      subtitle={localized.addPinSub}
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
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading && <span className="bjm-spinner" />}
            {loading ? localized.submitting : localized.addPin}
          </button>
        </>
      }
    >
      {status === "error" && errorMsg && <div className="bjm-error">{errorMsg}</div>}

      {/* Dropped-pin location readout */}
      <div className="bjm-coords">
        <span className="bjm-coords-pin" />
        <span className="bjm-coords-text">
          <span className="bjm-coords-label">{localized.pinLocation}</span>
          <span className="bjm-coords-val">{lat}, {lon}</span>
        </span>
      </div>

      {/* Name */}
      <div className="bjm-field">
        <label className="bjm-label" htmlFor="add-name">{localized.bizName}</label>
        <input
          id="add-name"
          className="bjm-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </div>

      {/* Categories — on-brand toggle chips */}
      <div className="bjm-field">
        <label className="bjm-label">{localized.categories}</label>
        <div className="bjm-chips">
          {ALL_CATEGORIES.map((cat) => {
            const active = selectedCategories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                className={`bjm-chip${active ? " bjm-chip--active" : ""}`}
                onClick={() => toggleCategory(cat)}
                aria-pressed={active}
              >
                <span>{CATEGORY_GLYPH[cat]}</span>
                {localized[categoryLabelKey(cat)] || cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Phone */}
      <div className="bjm-field">
        <label className="bjm-label" htmlFor="add-phone">
          {localized.bizPhone}
          <span className="bjm-label-opt">{localized.optional}</span>
        </label>
        <input
          id="add-phone"
          className="bjm-input"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Website */}
      <div className="bjm-field">
        <label className="bjm-label" htmlFor="add-website">
          {localized.bizWebsite}
          <span className="bjm-label-opt">{localized.optional}</span>
        </label>
        <input
          id="add-website"
          className="bjm-input"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="bjm-field">
        <label className="bjm-label" htmlFor="add-description">
          {localized.description}
          <span className="bjm-label-opt">{localized.optional}</span>
        </label>
        <textarea
          id="add-description"
          className="bjm-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  )
}

export default Add
