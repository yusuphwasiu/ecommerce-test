# Checkout Redesign v2.0 - Guest Checkout Implementation

This is a monorepo implementation of the **Guest Checkout** feature for the Checkout Redesign v2.0 ecommerce project.

## Project Structure

```
ecommerce-test/
├── packages/
│   ├── frontend/                    # React checkout UI
│   ├── backend/                     # Node.js Express API
│   └── e2e/                         # Playwright end-to-end tests
├── .github/workflows/               # CI/CD configuration
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                      # Prettier configuration
└── package.json                    # Root package configuration
```

## Features Implemented

### ✅ Acceptance Criteria

1. **AC-1: Guest users not required to create account**
   - Checkout flow allows skipping account creation
   - Email capture for order confirmation
   - No authentication required to complete purchase

2. **AC-2: Email validation with user feedback**
   - Real-time email validation on frontend
   - Server-side email validation
   - Error message: "Please enter a valid email address"
   - RFC 5322 compliant email validation

3. **AC-3: Payment method selection required**
   - Conditional validation for payment method
   - Error message: "Select a payment method to continue"
   - Supported methods: credit_card, debit_card, paypal, apple_pay, google_pay

### ✅ Subtasks Completed

- [x] **ST-1: Design guest checkout flow** - Flow diagram and component architecture
- [x] **ST-2: Implement core guest checkout functionality** - Backend API & React component
- [x] **ST-3: Implement email capture logic** - EmailCapture component with hooks
- [x] **ST-4: Develop input validation for email** - Zod schemas with real-time validation
- [x] **ST-5: Conduct end-to-end testing for guest checkout** - Playwright test suite

## Tech Stack

- **Frontend**: React 18, TypeScript, Axios, Zod
- **Backend**: Node.js, Express, TypeScript, Zod, PostgreSQL (ready)
- **Testing**: Playwright (E2E), Jest (Unit)
- **Tooling**: ESLint, Prettier, Yarn Workspaces

## Getting Started

### Prerequisites

- Node.js 16+ (or 18+)
- Yarn (or npm)

### Installation

```bash
# Install dependencies for all packages
yarn install
# or
npm install
```

### Development

```bash
# Start all services in development mode
yarn dev

# Or start services individually:

# Start backend API (http://localhost:3000)
cd packages/backend && yarn dev

# Start frontend (http://localhost:3000)
cd packages/frontend && yarn dev
```

### Testing

```bash
# Run unit tests
yarn workspace @checkout/backend test

# Run E2E tests
yarn workspace @checkout/e2e test

# Run E2E tests in headed mode (see browser)
yarn workspace @checkout/e2e test:headed
```

### Linting & Formatting

```bash
# Lint all packages
yarn lint

# Format all packages
yarn format
```

## API Documentation

### Base URL
```
http://localhost:3000/api/checkout
```

### Endpoints

#### 1. Create Guest Order
**POST** `/api/checkout/guest`

Request body:
```json
{
  "email": "guest@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-123-4567",
  "paymentMethod": "credit_card",
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "items": [
    { "productId": "prod1", "quantity": 1, "price": 99.99 }
  ],
  "totalAmount": 99.99,
  "acceptTerms": true
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "guest@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "confirmed",
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "message": "Guest checkout completed successfully"
}
```

#### 2. Get Order by ID
**GET** `/api/checkout/orders/:orderId`

Response (200 OK):
```json
{
  "success": true,
  "data": { /* order object */ }
}
```

#### 3. Get Orders by Email
**GET** `/api/checkout/orders/email/:email`

Response (200 OK):
```json
{
  "success": true,
  "data": [ /* array of orders */ ]
}
```

### Error Responses

```json
{
  "error": "Please enter a valid email address",
  "statusCode": 400
}
```

Common error messages:
- "Please enter a valid email address"
- "Select a payment method to continue"
- "First name is required"
- "Last name is required"

## Validation Schema

### Email Validation
- Must be valid RFC 5322 format
- Automatically converted to lowercase
- Required field

### Payment Method Validation
- Required field
- Allowed values: `credit_card`, `debit_card`, `paypal`, `apple_pay`, `google_pay`

### Address Validation
- All fields required for billing address
- Postal code must match pattern: `^[A-Za-z0-9\s\-]{3,10}$`

### Phone Validation (Optional)
- Must match international phone format when provided
- Pattern: `^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$`

## Frontend Components

### GuestCheckout Component
Main checkout form component that handles:
- Email capture with real-time validation
- Personal information collection
- Billing address capture
- Payment method selection
- Terms acceptance

```tsx
<GuestCheckout
  items={cartItems}
  totalAmount={totalPrice}
  onSuccess={(orderId) => console.log('Order created:', orderId)}
  onError={(error) => console.error('Checkout failed:', error)}
/>
```

### EmailCapture Component
Specialized component for email input with built-in validation:

```tsx
<EmailCapture
  value={email}
  onEmailChange={(email, isValid) => setEmail(email)}
  onEmailBlur={(email) => console.log(email)}
  error={emailError}
/>
```

### useGuestCheckout Hook
Custom React hook for managing checkout state:

```tsx
const {
  order,
  loading,
  error,
  validateEmail,
  validatePaymentMethod,
  submitCheckout,
  resetError,
  reset
} = useGuestCheckout();
```

## Backend Services

### CheckoutService
Handles business logic:
- Order creation and validation
- Email validation
- Payment method validation
- Order retrieval by ID or email

### CheckoutController
Handles HTTP request/response:
- Creates guest orders
- Retrieves orders by ID
- Retrieves orders by email
- Error handling

## Testing

### Unit Tests
Located in `packages/backend/src/validation/__tests__/`

Test coverage:
- Email validation (valid/invalid formats)
- Payment method validation
- Full checkout validation
- Field requirement validation
- Address postal code validation

Run: `yarn workspace @checkout/backend test`

### E2E Tests
Located in `packages/e2e/tests/guestCheckout.spec.ts`

Test scenarios:
- Guest checkout without account creation
- Email validation error display
- Payment method selection requirement
- Successful order creation with API
- Order retrieval by ID
- Order retrieval by email

Run: `yarn workspace @checkout/e2e test`

## Future Enhancements

1. **Database Integration**
   - Migrate from in-memory storage to PostgreSQL
   - Add database migrations

2. **Email Service**
   - Integrate email service (SendGrid, AWS SES, etc.)
   - Send order confirmation emails

3. **Payment Processing**
   - Integrate payment gateway (Stripe, PayPal SDK)
   - Handle payment method tokenization

4. **Account Creation Flow**
   - Add optional account creation after checkout
   - Account recovery with email verification

5. **Analytics**
   - Track checkout abandonment
   - Monitor conversion metrics

6. **Internationalization**
   - Multi-language support
   - Regional address formats

## Deployment

### Production Build

```bash
# Build all packages
yarn build

# Start backend in production
cd packages/backend
npm start
```

### Docker Support (future)
Dockerfile configuration for containerized deployment

### CI/CD Pipeline
GitHub Actions workflow configured for:
- Linting
- Unit testing
- E2E testing
- Build verification

## Contributing

1. Follow ESLint and Prettier configurations
2. Write tests for new features
3. Update documentation
4. Use conventional commit messages

## License

Proprietary - Checkout Redesign v2.0 Project

## Support

For issues or questions:
1. Check the test files for usage examples
2. Review API documentation above
3. Check component prop types in source files
