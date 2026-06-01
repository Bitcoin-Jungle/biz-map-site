import React from "react"

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  /** Footer action buttons. Omitted on result (success/error) screens. */
  actions?: React.ReactNode
}

function Modal({ title, subtitle, onClose, children, actions }: ModalProps) {
  return (
    <div className="bjm-root" role="dialog" aria-modal="true" aria-labelledby="bjm-title">
      <div className="bjm-scrim" onClick={onClose} />
      <div className="bjm-wrap">
        <div className="bjm-card">
          <div className="bjm-head">
            <div className="bjm-head-text">
              <div className="bjm-title" id="bjm-title">{title}</div>
              {subtitle && <div className="bjm-sub">{subtitle}</div>}
            </div>
            <button className="bjm-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="bjm-body">{children}</div>

          {actions && <div className="bjm-foot">{actions}</div>}
        </div>
      </div>
    </div>
  )
}

export default Modal
