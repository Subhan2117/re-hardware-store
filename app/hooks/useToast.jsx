// hooks/use-toast.js
"use client"

import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description }) => {
    const id = Date.now() + Math.random()

    setToasts((prev) => [...prev, { id, title, description }])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast UI */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="max-w-xs rounded-xl bg-slate-900 text-white px-4 py-3 shadow-lg shadow-slate-900/40 border border-slate-700/60"
          >
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && (
              <p className="mt-1 text-xs text-slate-200 leading-snug">
                {t.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return ctx
}
