import { User, Vendor, Order } from "./admin.types";

/* ================= USERS ================= */

export const users: User[] = [
  {
    id: "u1",
    name: "John Customer",
    email: "john@demo.com",
    role: "customer",
    status: "active",
    createdAt: "2026-05-01",
    country: "Nigeria",
    lastLogin: "2026-05-25",
    totalSpent: 1200,

    orders: 4,
    wallet: 50000,

    risk: "low",
    flagged: false,
    verificationLevel: "kyc",
  },
  {
    id: "u2",
    name: "Sarah Malik",
    email: "sarah@demo.com",
    role: "customer",
    status: "active",
    createdAt: "2026-04-10",
    country: "Kenya",
    lastLogin: "2026-05-20",
    totalSpent: 540,

    orders: 2,
    wallet: 12000,

    risk: "medium",
    flagged: false,
    verificationLevel: "basic",
  },
  {
    id: "u3",
    name: "Admin Root",
    email: "admin@autobridge.com",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01",
    country: "Nigeria",
    lastLogin: "2026-05-26",
    totalSpent: 0,

    orders: 0,
    wallet: 0,

    risk: "low",
    flagged: false,
    verificationLevel: "kyc",
  },
];
/* ================= VENDORS ================= */

export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "TechNova Store",
    email: "tech@demo.com",
    status: "pending",
    country: "Nigeria",
    revenue: 1200000,
    products: 42,
    rating: 4.6,
    verified: false,
    totalOrders: 320,
    payoutAccount: "GTBank **** 2231",
  },
  {
    id: "v2",
    name: "Urban Carry",
    email: "urban@demo.com",
    status: "approved",
    country: "Nigeria",
    revenue: 540000,
    products: 18,
    rating: 4.2,
    verified: true,
    totalOrders: 98,
    payoutAccount: "Access **** 1120",
  },
  {
    id: "v3",
    name: "NextCore Gaming",
    email: "gaming@demo.com",
    status: "suspended",
    country: "Ghana",
    revenue: 210000,
    products: 12,
    rating: 3.9,
    verified: false,
    totalOrders: 44,
    payoutAccount: "Fidelity **** 9001",
  },
];

/* ================= ORDERS ================= */

export const orders: Order[] = [
  {
    id: "o1",
    customer: "John",
    vendor: "TechNova",
    amount: 240000,
    status: "in_transit",
    tracking: "DHL-999999",
    createdAt: "2026-05-22",
    paymentStatus: "paid",
    currency: "USD",
    items: 2,
    channel: "web",
  },
  {
    id: "o2",
    customer: "Sarah",
    vendor: "Urban Carry",
    amount: 11900,
    status: "delivered",
    tracking: "DHL-123456",
    createdAt: "2026-05-18",
    paymentStatus: "paid",
    currency: "USD",
    items: 1,
    channel: "mobile",
  },
  {
    id: "o3",
    customer: "Mike",
    vendor: "TechNova",
    amount: 89000,
    status: "processing",
    tracking: "PENDING",
    createdAt: "2026-05-26",
    paymentStatus: "pending",
    currency: "USD",
    items: 1,
    channel: "web",
  },
];

/* ================= PAYMENTS ================= */

export const payments = [
  {
    id: "pay_001",
    type: "vendor_payout",
    amount: 1200,
    status: "pending",
    method: "bank_transfer",
    vendor: "TechNova Store",
    createdAt: "2026-05-24",
  },
  {
    id: "pay_002",
    type: "platform_fee",
    amount: 89,
    status: "completed",
    method: "stripe",
    vendor: "Urban Carry",
    createdAt: "2026-05-20",
  },
  {
    id: "pay_003",
    type: "refund",
    amount: 59,
    status: "completed",
    method: "wallet",
    vendor: "TechNova Store",
    createdAt: "2026-05-19",
  },
];

/* ================= LOGISTICS / SHIPMENTS ================= */

export const shipments = [
  {
    tracking: "DHL-999999",
    status: "Out for Delivery",
    progress: 85,
    carrier: "DHL",
    origin: "Lagos",
    destination: "Ibadan",
    eta: "Today",
  },
  {
    tracking: "DHL-123456",
    status: "In Transit",
    progress: 60,
    carrier: "DHL",
    origin: "Lagos Hub",
    destination: "Nairobi",
    eta: "2–3 Days",
  },
  {
    tracking: "FEDEX-889201",
    status: "Processing",
    progress: 20,
    carrier: "FedEx",
    origin: "Warehouse A",
    destination: "Accra",
    eta: "Pending",
  },
];

/* ================= ANALYTICS SNAPSHOT ================= */

export const analytics = {
  revenue: {
    today: 24500,
    week: 162000,
    month: 920000,
  },
  users: {
    total: 12450,
    active: 8200,
  },
  vendors: {
    total: 320,
    pending: 42,
    active: 240,
  },
  orders: {
    total: 5400,
    processing: 320,
    delivered: 4800,
  },
  conversionRate: 3.8,
};

/* ================= SUPPORT / TICKETS ================= */

export const tickets = [
  {
    id: "t1",
    user: "John Customer",
    subject: "Order not delivered",
    status: "open",
    priority: "high",
  },
  {
    id: "t2",
    user: "TechNova Store",
    subject: "Payout delay",
    status: "pending",
    priority: "medium",
  },
];

/* ================= AUDIT LOG ================= */

export const auditLogs = [
  {
    id: "a1",
    action: "VENDOR_APPROVED",
    actor: "admin@autobridge.com",
    target: "TechNova Store",
    timestamp: "2026-05-25 10:22",
  },
  {
    id: "a2",
    action: "ORDER_UPDATED",
    actor: "system",
    target: "DHL-999999",
    timestamp: "2026-05-26 08:10",
  },
];