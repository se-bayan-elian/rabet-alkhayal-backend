export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export enum OptionType {
  SELECT = 'select',
  TEXT = 'text',
  NOTE = 'note',
  CHECKBOX = 'checkbox',
}

export enum PaymentMethod {
  MOYASAR = 'moyasar',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUND = 'refund',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
