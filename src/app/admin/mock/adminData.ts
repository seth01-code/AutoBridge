// /app/admin/mock/adminData.ts

export type UserRole = "customer" | "vendor" | "admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
  createdAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  country: string;
  revenue: number;
  products: number;
};

export type Order = {
  id: string;
  customer: string;
  vendor: string;
  amount: number;
  status: "processing" | "in_transit" | "delivered" | "refunded";
  tracking: string;
  createdAt: string;
};

export type Shipment = {
  tracking: string;
  status: string;
  progress: number;
};

export const users: AdminUser[] = [
  {
    id: "u1",
    name: "John Customer",
    email: "john@demo.com",
    role: "customer",
    status: "active",
    createdAt: "2026-05-01",
  },
  {
    id: "u2",
    name: "Vendor Jane",
    email: "vendor@demo.com",
    role: "vendor",
    status: "active",
    createdAt: "2026-04-20",
  },
  {
    id: "u3",
    name: "Admin Boss",
    email: "admin@demo.com",
    role: "admin",
    status: "active",
    createdAt: "2026-01-10",
  },
];

export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "TechNova Store",
    email: "technova@store.com",
    status: "pending",
    country: "Nigeria",
    revenue: 1200000,
    products: 42,
  },
  {
    id: "v2",
    name: "Urban Carry",
    email: "urban@carry.com",
    status: "approved",
    country: "USA",
    revenue: 5400000,
    products: 128,
  },
];

export const orders: Order[] = [
  {
    id: "o1",
    customer: "John Customer",
    vendor: "TechNova Store",
    amount: 249,
    status: "in_transit",
    tracking: "DHL-999999",
    createdAt: "2026-05-20",
  },
  {
    id: "o2",
    customer: "Alice Doe",
    vendor: "Urban Carry",
    amount: 119,
    status: "delivered",
    tracking: "DHL-123456",
    createdAt: "2026-05-18",
  },
];

export const shipments: Shipment[] = [
  {
    tracking: "DHL-999999",
    status: "In Transit",
    progress: 65,
  },
  {
    tracking: "DHL-123456",
    status: "Delivered",
    progress: 100,
  },
];