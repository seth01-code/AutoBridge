"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../../layouts/AppShell";

import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  Package,
  BadgeCheck,
  XCircle,
  Clock3,
  ImagePlus,
} from "lucide-react";

type ProductStatus = "Active" | "Draft" | "Out of Stock";

type VendorProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  sales: number;
  status: ProductStatus;
  createdAt: string;
};

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);

  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [filter, setFilter] = useState<ProductStatus | "All">("All");
  const [loading, setLoading] = useState(true);
const [dbProducts, setDbProducts] = useState<VendorProduct[]>([]);

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    sku: "",
    image: "",
    price: "",
    stock: "",
  });

  /* ================= CREATE PRODUCT ================= */

  function createProduct() {
    if (!form.name || !form.category || !form.price || !form.stock) {
      return alert("Please complete product details");
    }

    const newProduct: VendorProduct = {
      id: `PRD-${Date.now()}`,
      name: form.name,
      category: form.category,
      sku: form.sku || `SKU-${Math.floor(Math.random() * 9999)}`,
      image:
        form.image ||
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      price: Number(form.price),
      stock: Number(form.stock),
      sales: 0,
      status: Number(form.stock) > 0 ? "Active" : "Out of Stock",
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    setForm({
      name: "",
      category: "",
      sku: "",
      image: "",
      price: "",
      stock: "",
    });

    setShowCreate(false);
  }

  /* ================= DELETE PRODUCT ================= */

  function deleteProduct(id: string) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  /* ================= TOGGLE STATUS ================= */

  function toggleStatus(id: string) {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== id) return product;

        return {
          ...product,
          status: product.status === "Active" ? "Draft" : "Active",
        };
      }),
    );
  }

  async function handleExcelUpload(file: File) {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // mock vendor (since you said no auth yet)
      formData.append("vendorId", "VENDOR-MOCK-001");

      const res = await fetch("/api/products/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setUploadResult(data);

      if (data.success) {
        alert(`Upload complete: ${data.result.inserted} products added`);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  }

 async function fetchProducts() {
  try {
    setLoading(true);

    const res = await fetch(
      "/api/products?vendorId=VENDOR-MOCK-001",
    );

    const data = await res.json();

    if (data.success) {
      const mapped = data.data.map((p: any) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        image: p.images?.[0] || "",
        price: p.price,
        stock: p.stock,
        sales: 0,
        status:
          p.stock > 0 ? "Active" : "Out of Stock",
        createdAt: p.createdAt,
      }));

      // ✅ THIS IS THE EXACT PLACE YOU ADD IT
      setProducts(mapped);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  fetchProducts();
}, []);
  /* ================= FILTER ================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" ? true : product.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  /* ================= STATUS UI ================= */

  function statusStyle(status: ProductStatus) {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border border-green-500/20";

      case "Draft":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20";

      case "Out of Stock":
        return "bg-red-500/20 text-red-400 border border-red-500/20";
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0B1120] text-white p-4 sm:p-6">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Vendor Products</h1>

            <p className="text-white/50 mt-2">
              Manage inventory, stock, pricing and marketplace visibility
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-medium transition"
          >
            <Plus size={18} />
            Add Product
          </button>

          <label className="bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl flex items-center gap-2 cursor-pointer border border-white/10">
            <ImagePlus size={18} />
            {uploading ? "Uploading..." : "Upload Excel"}

            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleExcelUpload(file);
              }}
            />
          </label>
        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Products"
            value={products.length.toString()}
            icon={<Package size={20} />}
          />

          <StatCard
            title="Active Products"
            value={products
              .filter((p) => p.status === "Active")
              .length.toString()}
            icon={<BadgeCheck size={20} />}
          />

          <StatCard
            title="Draft Products"
            value={products
              .filter((p) => p.status === "Draft")
              .length.toString()}
            icon={<Clock3 size={20} />}
          />

          <StatCard
            title="Out of Stock"
            value={products
              .filter((p) => p.status === "Out of Stock")
              .length.toString()}
            icon={<XCircle size={20} />}
          />

          {uploadResult && (
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm">
              <p className="text-green-400">
                Inserted: {uploadResult?.result?.inserted || 0}
              </p>

              {uploadResult?.result?.failed?.length > 0 && (
                <p className="text-red-400 mt-2">
                  Failed rows: {uploadResult.result.failed.length}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ================= CONTROLS ================= */}

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6">
          {/* SEARCH */}

          <div className="relative w-full lg:w-[380px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or SKU..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          {/* FILTER */}

          <div className="flex gap-2 flex-wrap">
            {["All", "Active", "Draft", "Out of Stock"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-xl border text-sm transition ${
                  filter === status
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ================= PRODUCT TABLE ================= */}

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          {/* TABLE HEADER */}

          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-white/40 text-sm">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Stock</div>
            <div className="col-span-1">Sales</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* PRODUCTS */}

          <div className="divide-y divide-white/10">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-5 lg:px-6 lg:py-5">
                {/* MOBILE CARD */}

                <div className="lg:hidden flex flex-col gap-5">
                  <div className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 rounded-2xl object-cover border border-white/10"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>

                      <p className="text-white/40 text-sm mt-1">
                        {product.sku}
                      </p>

                      <div
                        className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs ${statusStyle(
                          product.status,
                        )}`}
                      >
                        {product.status}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoItem label="Category" value={product.category} />

                    <InfoItem
                      label="Price"
                      value={`₦${product.price.toLocaleString()}`}
                    />

                    <InfoItem label="Stock" value={product.stock.toString()} />

                    <InfoItem label="Sales" value={product.sales.toString()} />
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2">
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      onClick={() => toggleStatus(product.id)}
                      className="flex-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 py-3 rounded-xl"
                    >
                      Toggle
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* DESKTOP TABLE */}

                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  {/* PRODUCT */}

                  <div className="col-span-4 flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                    />

                    <div>
                      <h3 className="font-semibold">{product.name}</h3>

                      <p className="text-white/40 text-sm">{product.sku}</p>
                    </div>
                  </div>

                  {/* CATEGORY */}

                  <div className="col-span-2 text-white/70">
                    {product.category}
                  </div>

                  {/* PRICE */}

                  <div className="col-span-1 font-semibold">
                    ₦{product.price.toLocaleString()}
                  </div>

                  {/* STOCK */}

                  <div className="col-span-1">{product.stock}</div>

                  {/* SALES */}

                  <div className="col-span-1">{product.sales}</div>

                  {/* STATUS */}

                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${statusStyle(
                        product.status,
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>

                  {/* ACTIONS */}

                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => toggleStatus(product.id)}
                      className="w-10 h-10 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 flex items-center justify-center"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= EMPTY ================= */}

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-white/40">
            No products found
          </div>
        )}

        {/* ================= CREATE MODAL ================= */}

        {showCreate && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#111827] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Add New Product</h2>

                  <p className="text-white/40 text-sm mt-1">
                    Create a new marketplace listing
                  </p>
                </div>

                <button
                  onClick={() => setShowCreate(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="SKU"
                  value={form.sku}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sku: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Stock Quantity"
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock: e.target.value,
                    })
                  }
                />
              </div>

              {/* PREVIEW */}

              <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  {form.image ? (
                    <img
                      src={form.image}
                      className="w-24 h-24 rounded-2xl object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                      <ImagePlus size={30} />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">
                      {form.name || "Product Preview"}
                    </h3>

                    <p className="text-white/40">
                      {form.category || "Category"}
                    </p>

                    <div className="text-orange-400 font-bold text-xl mt-2">
                      ₦{Number(form.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl"
                >
                  Cancel
                </button>

                <button
                  onClick={createProduct}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 py-4 rounded-2xl font-semibold"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ================= REUSABLES ================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-white/40 text-sm">{title}</div>

        <div className="text-orange-400">{icon}</div>
      </div>

      <div className="text-3xl font-bold mt-4">{value}</div>
    </div>
  );
}

function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-orange-500"
    />
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/40 text-xs mb-1">{label}</p>

      <p className="font-medium">{value}</p>
    </div>
  );
}
