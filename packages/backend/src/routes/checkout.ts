import { Router } from 'express';
import { checkoutController } from '../controllers/checkoutController';

const router = Router();

/**
 * POST /api/checkout/guest
 * Create a guest checkout order
 * Body: {
 *   email: string,
 *   firstName: string,
 *   lastName: string,
 *   phone?: string,
 *   paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay',
 *   billingAddress: { street, city, state, postalCode, country },
 *   shippingAddress?: { street, city, state, postalCode, country },
 *   items: [{ productId, quantity, price }],
 *   totalAmount: number,
 *   acceptTerms: boolean
 * }
 * Response: { success: true, data: GuestOrder, message: string }
 */
router.post('/guest', async (req, res) => {
  await checkoutController.createGuestOrder(req, res);
});

/**
 * GET /api/checkout/orders/:orderId
 * Get a guest order by ID
 * Response: { success: true, data: GuestOrder }
 */
router.get('/orders/:orderId', async (req, res) => {
  await checkoutController.getOrder(req, res);
});

/**
 * GET /api/checkout/orders/email/:email
 * Get all guest orders for an email
 * Response: { success: true, data: GuestOrder[] }
 */
router.get('/orders/email/:email', async (req, res) => {
  await checkoutController.getOrdersByEmail(req, res);
});

export default router;
