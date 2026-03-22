import { v4 as uuidv4 } from 'uuid';

export interface GuestOrderInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  billingAddress: Address;
  shippingAddress?: Address;
  items: OrderItem[];
  totalAmount: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface GuestOrder extends GuestOrderInput {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export class GuestOrderModel {
  private id: string;
  private email: string;
  private firstName: string;
  private lastName: string;
  private phone?: string;
  private paymentMethod: string;
  private billingAddress: Address;
  private shippingAddress?: Address;
  private items: OrderItem[];
  private totalAmount: number;
  private status: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(input: GuestOrderInput) {
    this.id = uuidv4();
    this.email = input.email;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.phone = input.phone;
    this.paymentMethod = input.paymentMethod;
    this.billingAddress = input.billingAddress;
    this.shippingAddress = input.shippingAddress;
    this.items = input.items;
    this.totalAmount = input.totalAmount;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getStatus(): string {
    return this.status;
  }

  setStatus(status: string): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  toJSON(): GuestOrder {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      paymentMethod: this.paymentMethod as any,
      billingAddress: this.billingAddress,
      shippingAddress: this.shippingAddress,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status as any,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
