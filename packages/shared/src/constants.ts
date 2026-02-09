export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PAYMENT_METHODS = {
  CASH: "Cash",
  CARD: "Card",
  FPS: "FPS",
  OTHER: "Other",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const ORDER_STATUS = {
  COMPLETED: "completed",
  REFUNDED: "refunded",
  VOIDED: "voided",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
