import axios, { AxiosInstance } from 'axios';
import { GuestCheckoutInput } from '../validation/checkout.validation';

export interface GuestOrder {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  paymentMethod: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  success: boolean;
  data: GuestOrder;
  message: string;
}

class CheckoutApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createGuestOrder(payload: GuestCheckoutInput): Promise<CheckoutResponse> {
    try {
      const response = await this.client.post<CheckoutResponse>('/api/checkout/guest', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to process checkout');
      }
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<{ success: boolean; data: GuestOrder }> {
    try {
      const response = await this.client.get<{ success: boolean; data: GuestOrder }>(
        `/api/checkout/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch order');
      }
      throw error;
    }
  }

  async getOrdersByEmail(email: string): Promise<{ success: boolean; data: GuestOrder[] }> {
    try {
      const response = await this.client.get<{ success: boolean; data: GuestOrder[] }>(
        `/api/checkout/orders/email/${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message || 'Failed to fetch orders');
      }
      throw error;
    }
  }
}

export const checkoutApi = new CheckoutApi();
