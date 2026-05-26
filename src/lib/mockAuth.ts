export type Role = "customer" | "vendor" | "admin";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "John Customer",
    email: "customer@demo.com",
    role: "customer",
  },
  {
    id: "2",
    name: "Vendor Jane",
    email: "vendor@demo.com",
    role: "vendor",
  },
  {
    id: "3",
    name: "Admin Boss",
    email: "admin@demo.com",
    role: "admin",
  },
];

export function mockLogin(email: string, password?: string): MockUser | null {
  return MOCK_USERS.find(
    (u) => u.email === email && (!password || password === "123456789")
  ) || null;
}