import { toast } from "sonner";

/**
 * Centralized toast helpers — keeps usage consistent across the app.
 * Built on top of sonner with brand-aware messages.
 */
export const showToast = {
  success: (message: string, description?: string) =>
    toast.success(message, { description, duration: 3500 }),

  error: (message: string, description?: string) =>
    toast.error(message, { description, duration: 5000 }),

  info: (message: string, description?: string) =>
    toast.info(message, { description, duration: 3500 }),

  loading: (message: string) => toast.loading(message),

  /**
   * Wrap an async promise with optimistic toast states.
   * Useful for buttons that fire-and-forget API calls.
   */
  promise: <T>(
    fn: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(fn, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),

  dismiss: () => toast.dismiss(),
};
