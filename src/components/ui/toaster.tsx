"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant}>
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
          <ToastClose onClick={() => removeToast(id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}