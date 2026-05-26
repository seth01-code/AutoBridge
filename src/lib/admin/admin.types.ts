// ================= CORE =================
export type Role = "customer" | "vendor" | "admin";

export type UserStatus = "active" | "suspended" | "banned";

export type VendorStatus = "pending" | "approved" | "suspended";

export type RiskLevel = "low" | "medium" | "high";


export type OrderStatus =
  | "processing"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

// ================= USER =================
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;

  country: string;
  createdAt: string;
  lastLogin: string;

  totalSpent: number;

  // ✅ MATCH YOUR UI
  orders: number;        // instead of ordersCount
  wallet: number;        // instead of walletBalance

  risk: RiskLevel;
  flagged: boolean;
  verificationLevel: "unverified" | "basic" | "kyc";
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

  rating: number;
  verified: boolean;

  totalOrders: number;
  payoutAccount: string;
}

// ================= ORDERS =================
export type PaymentStatus = "pending" | "paid" | "failed";

export type OrderChannel = "web" | "mobile";

export interface Order {
  id: string;
  customer: string;
  vendor: string;

  amount: number;
  status: OrderStatus;

  tracking: string;

  createdAt: string;

  paymentStatus: PaymentStatus;
  currency: "USD" | "NGN" | "EUR" | "GBP";

  items: number;
  channel: OrderChannel;
}

// ================= PAYMENTS =================
export interface Payment {
  id: string;

  type: "vendor_payout" | "platform_fee" | "refund";

  amount: number;
  status: "pending" | "completed" | "failed";

  method: "bank_transfer" | "stripe" | "wallet";

  vendor: string;
  createdAt: string;
}

// ================= SHIPMENTS =================
export type Carrier = "DHL" | "FedEx" | "UPS" | "Local Courier";

export interface Shipment {
  tracking: string;
  status: string;

  progress: number;

  carrier: Carrier;

  origin: string;
  destination: string;

  eta: string;
}

// ================= ANALYTICS =================
export interface Analytics {
  revenue: {
    today: number;
    week: number;
    month: number;
  };

  users: {
    total: number;
    active: number;
  };

  vendors: {
    total: number;
    pending: number;
    active: number;
  };

  orders: {
    total: number;
    processing: number;
    delivered: number;
  };

  conversionRate: number;
}

// ================= SUPPORT =================
export interface Ticket {
  id: string;
  user: string;
  subject: string;
  status: "open" | "pending" | "closed";
  priority: "low" | "medium" | "high";
}

// ================= AUDIT LOG =================
export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
}