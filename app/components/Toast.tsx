import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  durationMs?: number;
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function Toast({ message, onClose, durationMs = 5000 }: ToastProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => setClosing(true), durationMs);
    return () => clearTimeout(dismissTimer);
  }, [durationMs]);

  useEffect(() => {
    if (!closing) return;
    // Let the fade-out transition finish before actually unmounting.
    const removeTimer = setTimeout(onClose, 200);
    return () => clearTimeout(removeTimer);
  }, [closing, onClose]);

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl px-5 py-4 max-w-sm shadow-lg transition-all duration-200 ${
        closing ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--color-badge-red-text)",
        borderLeft: "4px solid var(--color-badge-red-text)",
      }}
    >
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-badge-red-text)" }}>
          Something went wrong
        </p>
        <p className="text-sm" style={{ color: "var(--ink)" }}>{message}</p>
      </div>
      <button
        type="button"
        onClick={() => setClosing(true)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: "var(--ink)" }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export default Toast;
