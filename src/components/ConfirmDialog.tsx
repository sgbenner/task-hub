interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6 max-w-sm w-full">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
