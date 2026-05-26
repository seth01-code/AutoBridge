// /lib/admin/admin.service.ts

import { users, vendors, orders } from "./admin.mock";

export const AdminService = {
  // USERS
  getUsers: async () => {
    return Promise.resolve(users);
  },

  updateUserStatus: async (id: string, status: string) => {
    return Promise.resolve({ id, status });
  },

  // VENDORS
  getVendors: async () => {
    return Promise.resolve(vendors);
  },

  approveVendor: async (id: string) => {
    return Promise.resolve({ id, status: "approved" });
  },

  rejectVendor: async (id: string) => {
    return Promise.resolve({ id, status: "rejected" });
  },

  // ORDERS
  getOrders: async () => {
    return Promise.resolve(orders);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return Promise.resolve({ id, status });
  },
};