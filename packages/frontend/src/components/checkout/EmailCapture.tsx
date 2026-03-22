import React, { useState, useCallback } from 'react';
import { validateEmail } from '../validation/checkout.validation';

export interface EmailCaptureProps {
  onEmailChange: (email: string, isValid: boolean) => void;
  onEmailBlur?: (email: string) => void;
  value?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const EmailCapture: React.FC<EmailCaptureProps> = ({
  onEmailChange,
  onEmailBlur,
  value = '',
  placeholder = 'Enter your email address',
  error: externalError,
  disabled = false,
}) => {
  const [email, setEmail] = useState(value);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      setLocalError(null);

      if (newEmail) {
        const validation = validateEmail(newEmail);
        onEmailChange(newEmail, validation.valid);
        if (!validation.valid) {
          setLocalError(validation.error || null);
        }
      } else {
        onEmailChange(newEmail, false);
      }
    },
    [onEmailChange]
  );

  const handleBlur = useCallback(() => {
    if (email) {
      const validation = validateEmail(email);
      if (!validation.valid) {
        setLocalError(validation.error || null);
      }
    }
    onEmailBlur?.(email);
  }, [email, onEmailBlur]);

  const displayError = externalError || localError;

  return (
    <div className="form-group">
      <label htmlFor="email">Email Address</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!displayError}
        aria-describedby={displayError ? 'email-error' : undefined}
        className={`form-control ${displayError ? 'is-invalid' : ''}`}
        style={{
          borderColor: displayError ? '#dc3545' : undefined,
        }}
      />
      {displayError && (
        <div id="email-error" className="invalid-feedback" style={{ display: 'block', color: '#dc3545' }}>
          {displayError}
        </div>
      )}
    </div>
  );
};

export default EmailCapture;
