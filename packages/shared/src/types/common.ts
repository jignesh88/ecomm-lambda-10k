export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  search?: string;
}

export interface QueryParams
  extends PaginationParams,
    SortParams,
    FilterParams,
    SearchParams {}

export type EntityStatus = 'active' | 'inactive' | 'deleted';

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Image {
  id?: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface Metadata {
  [key: string]: any;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'partial'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
