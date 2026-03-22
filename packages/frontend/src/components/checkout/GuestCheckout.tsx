import React, { useState } from 'react';
import { GuestCheckoutInput } from '../validation/checkout.validation';
import { useGuestCheckout } from '../hooks/useGuestCheckout';
import { EmailCapture } from './checkout/EmailCapture';

export interface GuestCheckoutProps {
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export const GuestCheckout: React.FC<GuestCheckoutProps> = ({
  items,
  totalAmount,
  onSuccess,
  onError,
}) => {
  const { order, loading, error, submitCheckout, resetError } = useGuestCheckout();
  const [formData, setFormData] = useState<Partial<GuestCheckoutInput>>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    paymentMethod: undefined,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    acceptTerms: false,
  });
  const [emailValid, setEmailValid] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleEmailChange = (email: string, isValid: boolean) => {
    setFormData((prev) => ({ ...prev, email }));
    setEmailValid(isValid);
    if (formErrors.email) {
      const newErrors = { ...formErrors };
      delete newErrors.email;
      setFormErrors(newErrors);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method as any }));
    if (formErrors.paymentMethod) {
      const newErrors = { ...formErrors };
      delete newErrors.paymentMethod;
      setFormErrors(newErrors);
    }
  };

  const handleBillingAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value,
      } as any,
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!emailValid || !formData.email) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Select a payment method to continue';
    }
    if (!formData.billingAddress?.street?.trim()) {
      newErrors['billingAddress.street'] = 'Street address is required';
    }
    if (!formData.billingAddress?.city?.trim()) {
      newErrors['billingAddress.city'] = 'City is required';
    }
    if (!formData.billingAddress?.state?.trim()) {
      newErrors['billingAddress.state'] = 'State/Province is required';
    }
    if (!formData.billingAddress?.postalCode?.trim()) {
      newErrors['billingAddress.postalCode'] = 'Postal code is required';
    }
    if (!formData.billingAddress?.country?.trim()) {
      newErrors['billingAddress.country'] = 'Country is required';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();

    if (!validateForm()) {
      return;
    }

    const checkoutData: GuestCheckoutInput = {
      email: formData.email || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      phone: formData.phone || '',
      paymentMethod: formData.paymentMethod || 'credit_card',
      billingAddress: formData.billingAddress || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      acceptTerms: formData.acceptTerms || false,
    };

    await submitCheckout(checkoutData);

    if (order) {
      onSuccess?.(order.id);
    }
  };

  if (order) {
    return (
      <div className="checkout-success" style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase, {order.firstName}!</p>
        <p>Order ID: <strong>{order.id}</strong></p>
        <p>A confirmation email has been sent to <strong>{order.email}</strong></p>
        <p>Total Amount: <strong>${order.totalAmount.toFixed(2)}</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="guest-checkout-form" style={{ maxWidth: '600px' }}>
      <h2>Guest Checkout</h2>

      {error && (
        <div
          className="alert-error"
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
          }}
          role="alert"
        >
          {error.message}
        </div>
      )}

      {/* Email Section */}
      <fieldset style={{ marginBottom: '20px', border: 'none' }}>
        <legend style={{ marginBottom: '12px', fontWeight: 'bold' }}>Contact Information</legend>
        <EmailCapture
          value={formData.email}
          onEmailChange={handleEmailChange}
          error={formErrors.email}
          disabled={loading}
        />
      </fieldset>

      {/* Personal Information */}
      <fieldset style={{ marginBottom: '20px', border: 'none' }}>
        <legend style={{ marginBottom: '12px', fontWeight: 'bold' }}>Personal Information</legend>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            disabled={loading}
            className="form-control"
            aria-invalid={!!formErrors.firstName}
            style={{ borderColor: formErrors.firstName ? '#dc3545' : undefined }}
          />
          {formErrors.firstName && (
            <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
              {formErrors.firstName}
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            disabled={loading}
            className="form-control"
            aria-invalid={!!formErrors.lastName}
            style={{ borderColor: formErrors.lastName ? '#dc3545' : undefined }}
          />
          {formErrors.lastName && (
            <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
              {formErrors.lastName}
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label htmlFor="phone">Phone (Optional)</label>
          <input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={loading}
            className="form-control"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </fieldset>

      {/* Billing Address */}
      <fieldset style={{ marginBottom: '20px', border: 'none' }}>
        <legend style={{ marginBottom: '12px', fontWeight: 'bold' }}>Billing Address</legend>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label htmlFor="street">Street Address</label>
          <input
            id="street"
            type="text"
            value={formData.billingAddress?.street || ''}
            onChange={(e) => handleBillingAddressChange('street', e.target.value)}
            disabled={loading}
            className="form-control"
            aria-invalid={!!formErrors['billingAddress.street']}
            style={{ borderColor: formErrors['billingAddress.street'] ? '#dc3545' : undefined }}
          />
          {formErrors['billingAddress.street'] && (
            <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
              {formErrors['billingAddress.street']}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              value={formData.billingAddress?.city || ''}
              onChange={(e) => handleBillingAddressChange('city', e.target.value)}
              disabled={loading}
              className="form-control"
              aria-invalid={!!formErrors['billingAddress.city']}
              style={{ borderColor: formErrors['billingAddress.city'] ? '#dc3545' : undefined }}
            />
            {formErrors['billingAddress.city'] && (
              <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
                {formErrors['billingAddress.city']}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="state">State/Province</label>
            <input
              id="state"
              type="text"
              value={formData.billingAddress?.state || ''}
              onChange={(e) => handleBillingAddressChange('state', e.target.value)}
              disabled={loading}
              className="form-control"
              aria-invalid={!!formErrors['billingAddress.state']}
              style={{ borderColor: formErrors['billingAddress.state'] ? '#dc3545' : undefined }}
            />
            {formErrors['billingAddress.state'] && (
              <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
                {formErrors['billingAddress.state']}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div className="form-group">
            <label htmlFor="postalCode">Postal Code</label>
            <input
              id="postalCode"
              type="text"
              value={formData.billingAddress?.postalCode || ''}
              onChange={(e) => handleBillingAddressChange('postalCode', e.target.value)}
              disabled={loading}
              className="form-control"
              aria-invalid={!!formErrors['billingAddress.postalCode']}
              style={{ borderColor: formErrors['billingAddress.postalCode'] ? '#dc3545' : undefined }}
            />
            {formErrors['billingAddress.postalCode'] && (
              <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
                {formErrors['billingAddress.postalCode']}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              value={formData.billingAddress?.country || ''}
              onChange={(e) => handleBillingAddressChange('country', e.target.value)}
              disabled={loading}
              className="form-control"
              aria-invalid={!!formErrors['billingAddress.country']}
              style={{ borderColor: formErrors['billingAddress.country'] ? '#dc3545' : undefined }}
            />
            {formErrors['billingAddress.country'] && (
              <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
                {formErrors['billingAddress.country']}
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Payment Method */}
      <fieldset style={{ marginBottom: '20px', border: 'none' }}>
        <legend style={{ marginBottom: '12px', fontWeight: 'bold' }}>Payment Method</legend>
        <div
          className="form-group"
          aria-invalid={!!formErrors.paymentMethod}
          style={{ borderColor: formErrors.paymentMethod ? '#dc3545' : undefined }}
        >
          {['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'].map((method) => (
            <label key={method} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={formData.paymentMethod === method}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={loading}
                style={{ marginRight: '8px' }}
              />
              {method.toUpperCase().replace(/_/g, ' ')}
            </label>
          ))}
          {formErrors.paymentMethod && (
            <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
              {formErrors.paymentMethod}
            </div>
          )}
        </div>
      </fieldset>

      {/* Terms */}
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.acceptTerms || false}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            disabled={loading}
            style={{ marginRight: '8px' }}
            aria-invalid={!!formErrors.acceptTerms}
          />
          I accept the terms and conditions
        </label>
        {formErrors.acceptTerms && (
          <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '4px' }}>
            {formErrors.acceptTerms}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Items ({items.length}):</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Total:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !emailValid}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading || !emailValid ? '#ccc' : '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !emailValid ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Processing...' : `Complete Purchase - $${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default GuestCheckout;
