// ================= CORE ROLES =================
export type Role = "customer" | "vendor" | "admin";

// ================= USER STATUS =================
export type UserStatus = "active" | "suspended" | "banned" | "pending";

// ================= VENDOR STATUS =================
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

// ================= ORDER STATUS =================
export type OrderStatus =
  | "processing"
  | "packed"
  | "in_transit"
  | "delivered"
  | "refunded"
  | "cancelled";

// ================= SHIPMENT STATUS =================
export type ShipmentStatus =
  | "pending"
  | "packed"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "returned";

// ================= CARRIER =================
export type Carrier = "DHL" | "FedEx" | "UPS" | "Local Courier" | "Unassigned";

// ================= PAYMENT STATUS =================
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// ================= USER =================
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;

  walletBalance: number;
  totalOrders: number;

  riskScore: "low" | "medium" | "high";

  lastLogin?: string;
  createdAt: string;
}

// ================= VENDOR =================
export interface Vendor {
  id: string;
  name: string;
  email: string;
  status: VendorStatus;
  country: string;

  revenue: number;
  products: number;
  rating?: number;

  walletBalance: number;
  totalSales: number;

  createdAt: string;
}

// ================= ORDER =================
export interface Order {
  id: string;
  customer: string;
  vendor: string;

  amount: number;
  status: OrderStatus;

  tracking: string;

  createdAt: string;
}

// ================= SHIPMENT =================
export interface Shipment {
  id: string;

  tracking: string;
  orderId: string;

  status: ShipmentStatus;

  progress: number;

  carrier: Carrier;

  origin: string;
  destination: string;

  eta: string;

  createdAt: string;
  updatedAt?: string;
}

// ================= PAYMENT =================
export interface Payment {
  id: string;

  type: "vendor_payout" | "platform_fee" | "refund";

  amount: number;
  currency: "NGN" | "USD" | "EUR" | "GBP";

  status: PaymentStatus;

  vendorId?: string;
  orderId?: string;

  createdAt: string;
}

// ================= ANALYTICS SNAPSHOT =================
export interface AnalyticsSnapshot {
  date: string;

  users: number;
  vendors: number;
  orders: number;

  revenue: number;
  profit: number;

  activeShipments: number;
}

// ================= AUDIT LOG =================
export interface AuditLog {
  id: string;

  action: string;
  performedBy: string;

  targetType: "user" | "vendor" | "order" | "shipment";

  targetId: string;

  timestamp: string;
}