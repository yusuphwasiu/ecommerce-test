# Development Guide

This guide provides instructions for developing and extending the Guest Checkout feature.

## Prerequisites

- Node.js 18+ or 20+
- Yarn 1.22+
- Git
- A code editor (VS Code recommended)

## Setting Up Development Environment


### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ecommerce-test

# Install dependencies
yarn install
```

### 2. Environment Setup

```bash
# Backend environment
cd packages/backend
cp .env.example .env
# Edit .env with your settings

# Frontend environment
cd ../frontend
cp .env.example .env
# Edit .env with your settings

cd ../..
```

### 3. Start Development Servers

**Option A: Start all services**
```bash
yarn dev
```

**Option B: Start services individually**

Terminal 1 - Backend API:
```bash
cd packages/backend
yarn dev
```

Terminal 2 - Frontend:
```bash
cd packages/frontend
yarn dev
```

Terminal 3 - E2E Tests (optional):
```bash
cd packages/e2e
yarn test:headed
```

## Project Structure Deep Dive

### Backend Architecture

```
packages/backend/src/
├── validation/           # Zod schemas and validation functions
│   ├── checkout.validation.ts
│   └── __tests__/
├── models/              # Data models
│   └── GuestOrder.ts
├── services/            # Business logic
│   └── checkoutService.ts
├── controllers/         # HTTP handlers
│   └── checkoutController.ts
├── middleware/          # Express middleware
│   └── errorHandler.ts
├── routes/              # API routes
│   └── checkout.ts
└── server.ts            # Express app setup
```

**Data Flow:**
1. Request → Routes → Controller
2. Controller → Service (validation + business logic)
3. Service → Model → Response

### Frontend Architecture

```
packages/frontend/src/
├── components/
│   └── checkout/
│       ├── GuestCheckout.tsx    # Main form component
│       └── EmailCapture.tsx     # Email input component
├── hooks/
│   └── useGuestCheckout.ts      # State management
├── services/
│   └── checkoutApi.ts           # API client
├── validation/
│   └── checkout.validation.ts   # Shared validation
└── App.tsx
```

**Component Hierarchy:**
```
<App>
  └─ <GuestCheckout>
      ├─ <EmailCapture>
      └─ Form fields + order summary
```

## Common Development Tasks

### Adding a New Validation Rule

1. **Update the schema** in both validation files:
   ```typescript
   // packages/backend/src/validation/checkout.validation.ts
   // packages/frontend/src/validation/checkout.validation.ts
   
   export const guestCheckoutSchema = z.object({
     // ... existing fields
     newField: z.string().min(1, 'Error message here'),
   });
   ```

2. **Update the component** (frontend):
   ```tsx
   // In GuestCheckout.tsx
   <input
     value={formData.newField || ''}
     onChange={(e) => handleInputChange('newField', e.target.value)}
   />
   ```

3. **Write tests** (backend):
   ```typescript
   // In packages/backend/src/validation/__tests__/checkout.validation.test.ts
   it('should validate newField', () => {
     const result = validateGuestCheckout({
       ...validCheckoutData,
       newField: 'invalid'
     });
     expect(result.valid).toBe(false);
   });
   ```

### Adding a New API Endpoint

1. **Create the controller method**:
   ```typescript
   // packages/backend/src/controllers/checkoutController.ts
   async myNewMethod(req: Request, res: Response): Promise<void> {
     try {
       // Implementation
       res.status(200).json({ success: true });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }
   ```

2. **Add the route**:
   ```typescript
   // packages/backend/src/routes/checkout.ts
   router.get('/my-endpoint', async (req, res) => {
     await checkoutController.myNewMethod(req, res);
   });
   ```

3. **Add API client method** (frontend):
   ```typescript
   // packages/frontend/src/services/checkoutApi.ts
   async myNewMethod(): Promise<MyResponse> {
     try {
       const response = await this.client.get<MyResponse>('/api/checkout/my-endpoint');
       return response.data;
     } catch (error) {
       throw new Error(/* error handling */);
     }
   }
   ```

### Running Tests

```bash
# Unit tests only
yarn workspace @checkout/backend test

# Unit tests with coverage
yarn workspace @checkout/backend test -- --coverage

# E2E tests (headless)
yarn workspace @checkout/e2e test

# E2E tests (visible browser)
yarn workspace @checkout/e2e test:headed

# E2E tests in debug mode
yarn workspace @checkout/e2e test:debug
```

### Debugging

**Backend debugging with VS Code:**

1. Add debugger statement or breakpoint
2. Run: `cd packages/backend && node --inspect-brk -r ts-node/register src/server.ts`
3. Open `chrome://inspect` in Chrome
4. Click "inspect" on the ts-node process

**Frontend debugging:**

1. React DevTools browser extension recommended
2. Console logs appear in browser DevTools
3. Network requests visible in Network tab

**E2E test debugging:**

```bash
yarn workspace @checkout/e2e test:debug
# Opens interactive debug mode in browser
```

### Linting and Formatting

```bash
# Check linting errors
yarn lint

# Auto-fix linting errors
yarn workspace @checkout/backend lint -- --fix
yarn workspace @checkout/frontend lint -- --fix

# Format code
yarn format
```

### Code Style Guide

- **Naming Conventions:**
  - Files: `camelCase.ts` (components: `PascalCase.tsx`)
  - Functions: `camelCase()`
  - Classes: `PascalCase`
  - Constants: `UPPER_CASE`

- **TypeScript:**
  - Always use type annotations for functions
  - Export types with `export type`
  - Use interfaces for object shapes

- **React:**
  - Use functional components with hooks
  - Props interfaces named: `ComponentNameProps`
  - useCallback for event handlers
  - useState for local component state

## Common Issues and Solutions

### Issue: "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 yarn workspace @checkout/backend dev
```

### Issue: "Module not found" errors after install
```bash
# Clean install
rm -rf node_modules yarn.lock
yarn install
```

### Issue: ESLint errors in IDE
```bash
# Restart the ESLint server in VS Code
# Press Cmd+Shift+P, then "ESLint: Restart ESLint Server"
```

### Issue: Tests not finding modules
```bash
# Clear Jest cache
yarn workspace @checkout/backend test -- --clearCache
```

## Performance Optimization Tips

1. **Component Optimization:**
   - Use `React.memo()` for non-changing props
   - `useCallback()` for stable function references
   - `useMemo()` for expensive calculations

2. **API Optimization:**
   - Batch multiple requests when possible
   - Use request caching in CheckoutApi
   - Implement pagination for large result sets

3. **Validation Optimization:**
   - Debounce real-time validation (email)
   - Cache validation results
   - Skip server-side validation on client-validated data

## Git Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feat/guest-checkout-improvements
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new validation rule"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feat/guest-checkout-improvements
   ```

4. **Commit message format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `test:` Test additions/changes
   - `docs:` Documentation
   - `refactor:` Code reorganization
   - `style:` Code style changes

## Deployment Checklist

- [ ] All tests passing (`yarn test`)
- [ ] Linting passed (`yarn lint`)
- [ ] Code formatted (`yarn format`)
- [ ] Environment variables configured
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] No console errors/warnings
- [ ] Performance acceptable
- [ ] Accessibility checks passed

## Resources

- [Zod Documentation](https://zod.dev)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Playwright Testing](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

1. Check test files for usage examples
2. Review component prop types and JSDoc comments
3. Search GitHub issues
4. Check CHANGELOG.md for recent changes
5. Ask team members on Slack/Teams
