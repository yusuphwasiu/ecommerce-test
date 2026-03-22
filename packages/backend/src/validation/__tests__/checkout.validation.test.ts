import { validateEmail, validatePaymentMethod, validateGuestCheckout } from '../validation/checkout.validation';

describe('Checkout Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid email');
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
    });

    it('should reject email without domain', () => {
      const result = validateEmail('test@');
      expect(result.valid).toBe(false);
    });

    it('should reject email without local part', () => {
      const result = validateEmail('@example.com');
      expect(result.valid).toBe(false);
    });

    it('should convert email to lowercase', () => {
      const result = validateEmail('TEST@EXAMPLE.COM');
      expect(result.valid).toBe(true);
    });
  });

  describe('validatePaymentMethod', () => {
    it('should accept valid payment methods', () => {
      const validMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
      validMethods.forEach((method) => {
        const result = validatePaymentMethod(method);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid payment method', () => {
      const result = validatePaymentMethod('crypto_coin');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty payment method', () => {
      const result = validatePaymentMethod('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateGuestCheckout', () => {
    const validCheckoutData = {
      email: 'guest@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-800-123-4567',
      paymentMethod: 'credit_card',
      billingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      acceptTerms: true,
    };

    it('should validate correct checkout data', () => {
      const result = validateGuestCheckout(validCheckoutData);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should require first name', () => {
      const data = { ...validCheckoutData, firstName: '' };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('First name');
    });

    it('should require last name', () => {
      const data = { ...validCheckoutData, lastName: '' };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Last name');
    });

    it('should require valid email', () => {
      const data = { ...validCheckoutData, email: 'invalid' };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid email');
    });

    it('should require payment method', () => {
      const data = { ...validCheckoutData, paymentMethod: '' };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
    });

    it('should require billing address fields', () => {
      const data = {
        ...validCheckoutData,
        billingAddress: {
          street: '',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
      };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Street');
    });

    it('should require terms acceptance', () => {
      const data = { ...validCheckoutData, acceptTerms: false };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('terms');
    });

    it('should allow optional phone field', () => {
      const data = { ...validCheckoutData, phone: '' };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(true);
    });

    it('should allow optional shipping address', () => {
      const { shippingAddress: _unused, ...data } = validCheckoutData as any;
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(true);
    });

    it('should validate postal code format', () => {
      const data = {
        ...validCheckoutData,
        billingAddress: {
          ...validCheckoutData.billingAddress,
          postalCode: '!!!',
        },
      };
      const result = validateGuestCheckout(data);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('postal code');
    });
  });
});
