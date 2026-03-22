import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api/checkout';

test.describe('Guest Checkout', () => {
  test('should allow guest user to checkout without creating account', async ({ page }) => {
    // Navigate to checkout page
    await page.goto(`${BASE_URL}`);

    // Fill in email
    const emailInput = page.locator('#email');
    await emailInput.fill('guest@example.com');
    await expect(emailInput).toHaveValue('guest@example.com');

    // Verify no account creation is required
    const accountButton = page.locator('[data-testid="create-account"]');
    await expect(accountButton).not.toBeVisible();
  });

  test('should validate email format and show error for invalid email', async ({ page }) => {
    // Navigate to checkout page
    await page.goto(`${BASE_URL}`);

    // Try to enter invalid email
    const emailInput = page.locator('#email');
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    // Expect validation error
    const errorMessage = page.locator('#email-error');
    await expect(errorMessage).toContainText('Please enter a valid email address');
  });

  test('should show error when payment method is not selected', async ({ page }) => {
    // Navigate to checkout page
    await page.goto(`${BASE_URL}`);

    // Fill in required fields except payment method
    await page.locator('#email').fill('guest@example.com');
    await page.locator('#firstName').fill('John');
    await page.locator('#lastName').fill('Doe');
    await page.locator('#street').fill('123 Main St');
    await page.locator('#city').fill('New York');
    await page.locator('#state').fill('NY');
    await page.locator('#postalCode').fill('10001');
    await page.locator('#country').fill('USA');
    await page.locator('input[name="acceptTerms"]').check();

    // Try to submit without selecting payment method
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Expect payment method error
    const paymentError = page.locator('[role="alert"]').first();
    await expect(paymentError).toContainText('payment method');
  });

  test('should successfully create guest order with valid data', async ({ page, request }) => {
    // Start server with mock data
    const checkoutData = {
      email: 'test@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-123-4567',
      paymentMethod: 'credit_card',
      billingAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
      },
      items: [{ productId: 'prod1', quantity: 1, price: 99.99 }],
      totalAmount: 99.99,
      acceptTerms: true,
    };

    // Make API request directly
    const response = await request.post(`${API_URL}/guest`, {
      data: checkoutData,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data.email).toBe('test@example.com');
    expect(body.data.status).toBe('confirmed');
  });

  test('should reject invalid email on API', async ({ request }) => {
    const checkoutData = {
      email: 'invalid-email',
      firstName: 'Test',
      lastName: 'User',
      paymentMethod: 'credit_card',
      billingAddress: {
        street: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA',
      },
      items: [{ productId: 'prod1', quantity: 1, price: 99.99 }],
      totalAmount: 99.99,
      acceptTerms: true,
    };

    const response = await request.post(`${API_URL}/guest`, {
      data: checkoutData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('email');
  });

  test('should reject missing payment method on API', async ({ request }) => {
    const checkoutData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      paymentMethod: '',
      billingAddress: {
        street: '321 Elm St',
        city: 'Houston',
        state: 'TX',
        postalCode: '77001',
        country: 'USA',
      },
      items: [{ productId: 'prod1', quantity: 1, price: 99.99 }],
      totalAmount: 99.99,
      acceptTerms: true,
    };

    const response = await request.post(`${API_URL}/guest`, {
      data: checkoutData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('payment');
  });

  test('should retrieve order by ID', async ({ request }) => {
    // First create an order
    const checkoutData = {
      email: 'retrieve@example.com',
      firstName: 'Get',
      lastName: 'Order',
      paymentMethod: 'paypal',
      billingAddress: {
        street: '100 Test Lane',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        country: 'USA',
      },
      items: [{ productId: 'prod2', quantity: 2, price: 49.99 }],
      totalAmount: 99.98,
      acceptTerms: true,
    };

    const createResponse = await request.post(`${API_URL}/guest`, {
      data: checkoutData,
    });

    const createdOrder = await createResponse.json();
    const orderId = createdOrder.data.id;

    // Now retrieve it
    const getResponse = await request.get(`${API_URL}/orders/${orderId}`);
    expect(getResponse.status()).toBe(200);
    const order = await getResponse.json();
    expect(order.data.id).toBe(orderId);
    expect(order.data.email).toBe('retrieve@example.com');
  });

  test('should retrieve orders by email', async ({ request }) => {
    const email = 'batch@example.com';

    // Create multiple orders
    for (let i = 0; i < 2; i++) {
      await request.post(`${API_URL}/guest`, {
        data: {
          email,
          firstName: `User${i}`,
          lastName: 'Test',
          paymentMethod: 'credit_card',
          billingAddress: {
            street: `${i} Test St`,
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'USA',
          },
          items: [{ productId: `prod${i}`, quantity: 1, price: 99.99 }],
          totalAmount: 99.99,
          acceptTerms: true,
        },
      });
    }

    // Retrieve orders by email
    const response = await request.get(`${API_URL}/orders/email/${encodeURIComponent(email)}`);
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.data.every((order: any) => order.email === email)).toBe(true);
  });
});
