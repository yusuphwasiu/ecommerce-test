import { GuestOrderModel, GuestOrderInput, GuestOrder } from '../models/GuestOrder';
import { validateGuestCheckout, validateEmail, validatePaymentMethod } from '../validation/checkout.validation';

interface CheckoutServiceInterface {
  processGuestCheckout(input: GuestOrderInput): Promise<GuestOrder | null>;
  getOrderById(orderId: string): Promise<GuestOrder | null>;
  getOrderByEmail(email: string): Promise<GuestOrder[]>;
}

export class CheckoutService implements CheckoutServiceInterface {
  private orders: Map<string, GuestOrderModel> = new Map();
  private emailOrders: Map<string, GuestOrderModel[]> = new Map();

  async processGuestCheckout(input: GuestOrderInput): Promise<GuestOrder | null> {
    // Validate email
    const emailValidation = validateEmail(input.email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error || 'Invalid email');
    }

    // Validate payment method
    const paymentValidation = validatePaymentMethod(input.paymentMethod);
    if (!paymentValidation.valid) {
      throw new Error(paymentValidation.error || 'Invalid payment method');
    }

    // Validate full checkout data
    const validation = validateGuestCheckout(input);
    if (!validation.valid) {
      throw new Error(validation.error || 'Validation failed');
    }

    try {
      // Create guest order
      const order = new GuestOrderModel(input);
      order.setStatus('confirmed');

      // Store order in memory (replace with database in production)
      this.orders.set(order.getId(), order);

      // Store order for email lookup
      const email = input.email.toLowerCase();
      if (!this.emailOrders.has(email)) {
        this.emailOrders.set(email, []);
      }
      this.emailOrders.get(email)!.push(order);

      // TODO: Send confirmation email
      console.log(`Order confirmation email would be sent to ${input.email}`);

      return order.toJSON();
    } catch (error) {
      console.error('Error processing guest checkout:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<GuestOrder | null> {
    const order = this.orders.get(orderId);
    if (!order) {
      return null;
    }
    return order.toJSON();
  }

  async getOrderByEmail(email: string): Promise<GuestOrder[]> {
    const orders = this.emailOrders.get(email.toLowerCase()) || [];
    return orders.map((order) => order.toJSON());
  }
}

export const checkoutService = new CheckoutService();
