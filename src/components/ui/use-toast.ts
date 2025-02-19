import { useState } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => {
    setToasts((current) => [...current, { ...toast, id: Date.now().toString() }]);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  // Add a `toast` function for convenience
  const toast = ({ title, description, variant = "default" }: Partial<Toast>) => {
    addToast({
      id: Date.now().toString(),
      title,
      description,
      variant,
    });
  };

  return { toasts, addToast, removeToast, toast };
}