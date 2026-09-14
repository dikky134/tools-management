interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
}

export default function ErrorMessage({
  message,
  onClose,
}: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3"
    >
      <div className="mt-0.5 flex-shrink-0 text-red-400">
        !
      </div>

      <p className="flex-1 text-xs leading-relaxed text-red-300">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-red-400 hover:text-red-200"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}