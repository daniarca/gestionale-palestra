// src/components/ConfirmDialog.jsx
import React from "react";

/**
 * ConfirmDialog - semplicissimo dialog di conferma.
 * Props:
 *  - open: boolean
 *  - title: string
 *  - message: string
 *  - onCancel: function
 *  - onConfirm: function
 */
export default function ConfirmDialog({ open, title = "Conferma", message = "", onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop" style={{
      position: "fixed", left: 0, top: 0, right: 0, bottom: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.4)", zIndex: 2000
    }}>
      <div style={{
        background: "white", padding: 20, borderRadius: 8, width: 420, maxWidth: "90%",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
      }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p style={{ marginTop: 8 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onCancel} style={{ padding: "6px 12px" }}>Annulla</button>
          <button onClick={onConfirm} style={{ padding: "6px 12px", background: "#c62828", color: "white", border: "none", borderRadius: 4 }}>
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}
