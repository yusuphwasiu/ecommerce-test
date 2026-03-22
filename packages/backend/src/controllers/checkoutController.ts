import { Request, Response } from 'express';
import { checkoutService } from '../services/checkoutService';
import { GuestOrderInput } from '../models/GuestOrder';

export class CheckoutController {
  async createGuestOrder(req: Request, res: Response): Promise<void> {
    try {
      const input: GuestOrderInput = req.body;

      // Validate required fields
      if (!input.email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      if (!input.paymentMethod) {
        res.status(400).json({ error: 'Select a payment method to continue' });
        return;
      }

      const order = await checkoutService.processGuestCheckout(input);
      res.status(201).json({
        success: true,
        data: order,
        message: 'Guest checkout completed successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const order = await checkoutService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.status(200).json({ success: true, data: order });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  async getOrdersByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const orders = await checkoutService.getOrderByEmail(email);

      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}

export const checkoutController = new CheckoutController();
