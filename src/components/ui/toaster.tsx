'use client'

import { X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:inset-auto sm:bottom-4 sm:right-4 sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={cn(
            'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border bg-background shadow-lg sm:w-96',
            toast.variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground',
            toast.variant === 'success' && 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700'
          )}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex-1 space-y-1">
              {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
              {toast.description && (
                <p className="text-sm text-muted-foreground">
                  {toast.description}
                </p>
              )}
              {toast.action}
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-foreground/60 transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
