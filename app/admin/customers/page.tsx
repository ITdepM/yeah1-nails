"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal";

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);

  // Modal states
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [visitsOpen, setVisitsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [visits, setVisits] = useState([]);

  // Load customers
  async function fetchCustomers() {
    const res = await fetch("/api/admin/customers");
    const data = await res.json();
    setCustomers(data.customers || []);
    setFiltered(data.customers || []);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search + filter logic
  useEffect(() => {
    let list = [...customers];

    if (search.trim() !== "") {
      list = list.filter(
        (c: any) =>
          (c.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search)
      );
    }

    if (todayOnly) {
      const today = new Date().toDateString();
      list = list.filter(
        (c: any) => new Date(c.createdAt).toDateString() === today
      );
    }

    setFiltered(list);
  }, [search, todayOnly, customers]);

  // Adjust points
  async function submitAdjust() {
    await fetch("/api/admin/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomer.id,
        amount: Number(adjustAmount),
      }),
    });
    setAdjustOpen(false);
    fetchCustomers();
  }

  // Redeem 150 points
  async function submitRedeem() {
    await fetch("/api/admin/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomer.id,
      }),
    });
    setRedeemOpen(false);
    fetchCustomers();
  }

  // Load visit history
  async function loadVisits(customer: any) {
    const res = await fetch("/api/admin/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
    });
    const data = await res.json();
    setVisits(data.visits);
    setVisitsOpen(true);
  }

  // Delete customer
  async function submitDelete() {
    await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: selectedCustomer.id }),
    });
    setDeleteOpen(false);
    fetchCustomers();
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-rose-600">Customers</h1>

        {/* Search + Filter */}
        <div className="flex items-center justify-between bg-white p-4 border rounded-xl shadow-sm">
          <input
            className="border p-2 rounded-lg w-1/2"
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setTodayOnly(!todayOnly)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              todayOnly ? "bg-rose-600 text-white" : "bg-gray-200"
            }`}
          >
            Today Only
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Points</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b">
                  <td
                    className="p-2 text-rose-600 underline cursor-pointer"
                    onClick={() => router.push(`/admin/customers/${c.id}`)}
                  >
                    {c.fullName || "-"}
                  </td>

                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.totalPoints}</td>

                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCustomer(c);
                        setAdjustAmount(0);
                        setAdjustOpen(true);
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      Adjust
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCustomer(c);
                        setRedeemOpen(true);
                      }}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Redeem
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCustomer(c);
                        loadVisits(c);
                      }}
                      className="px-2 py-1 bg-gray-600 text-white rounded"
                    >
                      Visits
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCustomer(c);
                        setDeleteOpen(true);
                      }}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modals BELOW */}
        <Modal
          open={adjustOpen}
          title={`Adjust Points – ${selectedCustomer?.fullName}`}
          onClose={() => setAdjustOpen(false)}
        >
          <input
            type="number"
            className="w-full border p-2 rounded-lg mb-3"
            placeholder="Enter + or - points"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(Number(e.target.value))}
          />
          <button
            onClick={submitAdjust}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
          >
            Apply Adjustment
          </button>
        </Modal>

        <Modal
          open={redeemOpen}
          title={`Redeem 150 Points – ${selectedCustomer?.fullName}`}
          onClose={() => setRedeemOpen(false)}
        >
          <p className="mb-3">Redeem 150 points for this customer?</p>
          <button
            onClick={submitRedeem}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
          >
            Confirm Redeem
          </button>
        </Modal>

        <Modal
          open={visitsOpen}
          title={`Visit History – ${selectedCustomer?.fullName}`}
          onClose={() => setVisitsOpen(false)}
        >
          <div className="max-h-64 overflow-y-auto">
            {visits.length === 0 && <p>No visits found.</p>}
            {visits.map((v: any) => (
              <div key={v.id} className="border-b py-2">
                <p className="text-sm">
                  <b>Check-in:</b> {new Date(v.checkInAt).toLocaleString()}
                </p>

                {v.checkOutAt && (
                  <p className="text-sm">
                    <b>Check-out:</b> {new Date(v.checkOutAt).toLocaleString()}
                  </p>
                )}

                <p className="text-sm"><b>Service:</b> {v.service || "-"}</p>
                <p className="text-sm"><b>Heard:</b> {v.heard || "-"}</p>
                <p className="text-sm"><b>Points:</b> {v.pointsAwarded}</p>
              </div>
            ))}
          </div>
        </Modal>

        <Modal
          open={deleteOpen}
          title={`Delete Customer – ${selectedCustomer?.fullName}`}
          onClose={() => setDeleteOpen(false)}
        >
          <p className="mb-3">This will permanently delete customer data.</p>
          <button
            onClick={submitDelete}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
          >
            Confirm Delete
          </button>
        </Modal>
      </div>
    </div>
  );
}
