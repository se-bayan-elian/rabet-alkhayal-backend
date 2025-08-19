export enum Role {
  User = 'user',
  Admin = 'admin',
}

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
  REFUND = 'refund',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
