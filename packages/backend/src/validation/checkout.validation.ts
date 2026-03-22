import { z } from 'zod';

// Email validation schema - RFC 5322 compliant
const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// Payment method schema
const paymentMethodSchema = z
  .enum(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'])
  .refine((value) => value !== undefined && value !== null, {
    message: 'Select a payment method to continue',
  });

// Guest checkout schema
export const guestCheckoutSchema = z.object({
  email: emailSchema,
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Please enter a valid phone number',
    })
    .optional()
    .or(z.literal('')),
  paymentMethod: paymentMethodSchema,
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    postalCode: z
      .string()
      .regex(/^[A-Za-z0-9\s\-]{3,10}$/, 'Please enter a valid postal code'),
    country: z.string().min(1, 'Country is required'),
  }),
  shippingAddress: z
    .object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State/Province is required'),
      postalCode: z
        .string()
        .regex(/^[A-Za-z0-9\s\-]{3,10}$/, 'Please enter a valid postal code'),
      country: z.string().min(1, 'Country is required'),
    })
    .optional(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms and conditions'),
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;

// Validation functions
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid email' };
  }
};

export const validatePaymentMethod = (method: string): { valid: boolean; error?: string } => {
  try {
    paymentMethodSchema.parse(method);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid payment method' };
  }
};

export const validateGuestCheckout = (
  data: unknown
): { valid: boolean; error?: string; data?: GuestCheckoutInput } => {
  try {
    const validData = guestCheckoutSchema.parse(data);
    return { valid: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Validation failed' };
  }
};
