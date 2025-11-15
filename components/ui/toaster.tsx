'use client'

import { Toaster as SonnerToaster, ToastOptions } from 'sonner'

const toastOptions: ToastOptions = {
  className:
    'rounded-lg border border-border bg-background text-foreground shadow-lg',
}

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      richColors
      toastOptions={toastOptions}
    />
  )
}

