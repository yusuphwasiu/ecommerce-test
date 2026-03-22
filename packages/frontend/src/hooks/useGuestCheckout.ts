import { useState, useCallback } from 'react';
import { checkoutApi, GuestOrder } from '../services/checkoutApi';
import { GuestCheckoutInput, validateEmail, validatePaymentMethod } from '../validation/checkout.validation';

export interface CheckoutError {
  field?: string;
  message: string;
}

export interface UseGuestCheckoutReturn {
  order: GuestOrder | null;
  loading: boolean;
  error: CheckoutError | null;
  validateEmail: (email: string) => { valid: boolean; error?: string };
  validatePaymentMethod: (method: string) => { valid: boolean; error?: string };
  submitCheckout: (data: GuestCheckoutInput) => Promise<void>;
  resetError: () => void;
  reset: () => void;
}

export const useGuestCheckout = (): UseGuestCheckoutReturn => {
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setOrder(null);
    setLoading(false);
    setError(null);
  }, []);

  const submitCheckout = useCallback(
    async (data: GuestCheckoutInput) => {
      try {
        setLoading(true);
        setError(null);

        // Validate email
        const emailValidation = validateEmail(data.email);
        if (!emailValidation.valid) {
          setError({ field: 'email', message: emailValidation.error || 'Invalid email' });
          setLoading(false);
          return;
        }

        // Validate payment method
        const paymentValidation = validatePaymentMethod(data.paymentMethod);
        if (!paymentValidation.valid) {
          setError({
            field: 'paymentMethod',
            message: paymentValidation.error || 'Invalid payment method',
          });
          setLoading(false);
          return;
        }

        const response = await checkoutApi.createGuestOrder(data);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError({ message });
        setLoading(false);
      }
    },
    []
  );

  return {
    order,
    loading,
    error,
    validateEmail,
    validatePaymentMethod,
    submitCheckout,
    resetError,
    reset,
  };
};
