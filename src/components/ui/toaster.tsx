import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/contexts/ToastContext"

export function Toaster() {
  const { toasts, dismissToast } = useToast()

  return (
    <RadixToastProvider duration={1000}>
      <ToastViewport>
        {toasts.map(({ id, title, description, variant, action }) => (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              <ToastTitle>{title}</ToastTitle>
              <ToastDescription>{description}</ToastDescription>
            </div>
            {action}
            <ToastClose onClick={() => dismissToast(id)} />
          </Toast>
        ))}
      </ToastViewport>
    </RadixToastProvider>
  )
}


