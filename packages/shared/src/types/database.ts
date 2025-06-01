import { BaseEntity, Address, Money, Image, Metadata } from './common';

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  metadata: Metadata;
}

export interface Product extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  categoryId?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  trackInventory: boolean;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  images: Image[];
  attributes: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  requiresShipping: boolean;
  taxable: boolean;
  vendor?: string;
  tags: string[];
  metadata: Metadata;
}

export interface User extends BaseEntity {
  cognitoSub: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  avatarUrl?: string;
  addresses: Address[];
  defaultBillingAddressId?: string;
  defaultShippingAddressId?: string;
  preferences: Record<string, any>;
  newsletterSubscribed: boolean;
  marketingConsent: boolean;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  metadata: Metadata;
}

export interface Cart extends BaseEntity {
  userId?: string;
  sessionId?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  appliedCoupons: any[];
  shippingAddress?: Address;
  billingAddress?: Address;
  status: 'active' | 'abandoned' | 'converted';
  abandonedAt?: Date;
  recoveryToken?: string;
  recoverySentAt?: Date;
  metadata: Metadata;
}

export interface CartItem extends BaseEntity {
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: Product;
  selectedOptions: Record<string, any>;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  userId?: string;
  email: string;
  phone?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  appliedCoupons: any[];
  billingAddress: Address;
  shippingAddress: Address;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'partially_refunded';
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  shippingMethod?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  customerNotes?: string;
  internalNotes?: string;
  metadata: Metadata;
}

export interface OrderItem extends BaseEntity {
  orderId: string;
  productId?: string;
  productName: string;
  productSku: string;
  productSnapshot: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions: Record<string, any>;
  fulfilledQuantity: number;
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';
}

export interface DatabaseQueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseConnection {
  query<T>(sql: string, params?: any[]): Promise<DatabaseQueryResult<T>>;
  transaction<T>(callback: (client: DatabaseConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface CacheConnection {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  flushdb(): Promise<void>;
  close(): Promise<void>;
}
