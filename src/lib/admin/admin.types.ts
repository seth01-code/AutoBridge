// /lib/admin/admin.types.ts

export type Role = "customer" | "vendor" | "admin";

export type AdminStatus = "active" | "suspended";

export type VendorStatus = "pending" | "approved" | "rejected";

export type OrderStatus =
  | "processing"
  | "in_transit"
  | "delivered"
  | "refunded"
  | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AdminStatus;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  status: VendorStatus;
  country: string;
  revenue: number;
  products: number;
}

export interface Order {
  id: string;
  customer: string;
  vendor: string;
  amount: number;
  status: OrderStatus;
  tracking: string;
  createdAt: string;
}