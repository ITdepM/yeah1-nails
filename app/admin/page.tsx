"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);

  const [customers, setCustomers] = useState<any[]>([]);
  const [visits, setVisits] = useState([]);
  const [logs, setLogs] = useState([]);

  const [kpis, setKpis] = useState({
    todayCheckins: 0,
    todaySignups: 0,
    totalCustomers: 0,
    totalVisits: 0,
  });

  // Search + filter
  const [search, setSearch] = useState("");
  const [filterToday, setFilterToday] = useState(false);

  // Modals
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [selectedVisits, setSelectedVisits] = useState([]);

  async function fetchAll() {
    setLoading(true);

    const c = await fetch("/api/admin/customers").then(r => r.json());
    const v = await fetch("/api/admin/all-visits").then(r => r.json());
    const l = await fetch("/api/admin/activity").then(r => r.json());
    const k = await fetch("/api/admin/kpis").then(r => r.json());

    setCustomers(c.customers);
    setVisits(v.visits);
    setLogs(l.logs);
    setKpis(k);

    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter((c: any) => {
    const matchText =
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    if (!filterToday) return matchText;

    // filter today signups
    const today = new Date();
    const created = new Date(c.createdAt);
    return (
      matchText &&
      created.getFullYear() === today.getFullYear() &&
      created.getMonth() === today.getMonth() &&
      created.getDate() === today.getDate()
    );
  });

  // Load visits for modal
  function openVisits(cust: any) {
    const list = visits.filter((v: any) => v.customerId === cust.id);
    setSelectedCustomer(cust);
    setSelectedVisits(list);
    setVisitModalOpen(true);
  }

  async function applyAdjust() {
    await fetch("/api/admin/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: selectedCustomer.id,
        amount: Number(adjustAmount),
      }),
    });

    setAdjustOpen(false);
    fetchAll();
  }

  async function applyRedeem() {
    await fetch("/api/admin/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: selectedCustomer.id }),
    });

    setRedeemOpen(false);
    fetchAll();
  }

  async function applyDelete() {
    await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: selectedCustomer.id }),
    });

    setDeleteOpen(false);
    fetchAll();
  }

  if (loading) return <p className="p-6">Loading admin…</p>;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 space-y-10 overflow-y-auto">

        {/* ================= KPI CARDS ================= */}
        <section>
          <h1 className="text-3xl font-bold text-rose-600 mb-4">Dashboard</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Today Check-ins</p>
              <p className="text-2xl font-bold">{kpis.todayCheckins}</p>
            </div>

            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Today Sign-ups</p>
              <p className="text-2xl font-bold">{kpis.todaySignups}</p>
            </div>

            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold">{kpis.totalCustomers}</p>
            </div>

            <div className="p-4 bg-white border rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Total Visits</p>
              <p className="text-2xl font-bold">{kpis.totalVisits}</p>
            </div>
          </div>
        </section>

        {/* ================= CUSTOMERS ================= */}
        <section className="bg-white p-4 border rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Customers</h2>

          {/* Search bar */}
          <div className="flex items-center gap-3 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full border p-2 rounded-lg"
            />
            <button
              onClick={() => setFilterToday(!filterToday)}
              className={`px-3 py-2 rounded-lg ${
                filterToday ? "bg-rose-600 text-white" : "bg-gray-200"
              }`}
            >
              Today
            </button>
          </div>

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
              {filteredCustomers.map((c: any) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.fullName}</td>
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
                      onClick={() => openVisits(c)}
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
        </section>

        {/* ================= ACTIVITY LOGS ================= */}
        <section className="bg-white p-4 border rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Activity Logs</h2>

          <div className="max-h-80 overflow-y-auto space-y-3">
            {logs.map((log: any) => (
              <div key={log.id} className="border-b pb-2">
                <p className="text-sm">
                  <b>{log.action}</b> — {log.details}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>


      {/* ================= MODALS ================= */}

      {/* Adjust points */}
      {adjustOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-80 space-y-3">
            <h3 className="text-lg font-semibold">
              Adjust Points — {selectedCustomer?.fullName}
            </h3>

            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Number(e.target.value))}
              className="w-full border p-2 rounded-lg"
            />

            <button
              onClick={applyAdjust}
              className="w-full bg-blue-600 text-white p-2 rounded-lg"
            >
              Apply
            </button>

            <button
              onClick={() => setAdjustOpen(false)}
              className="w-full p-2 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Redeem */}
      {redeemOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-80 space-y-3">
            <h3 className="text-lg font-semibold">
              Redeem 150 Points — {selectedCustomer?.fullName}
            </h3>

            <button
              onClick={applyRedeem}
              className="w-full bg-green-600 text-white p-2 rounded-lg"
            >
              Confirm Redeem
            </button>

            <button
              onClick={() => setRedeemOpen(false)}
              className="w-full p-2 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-80 space-y-3">
            <h3 className="text-lg font-semibold text-red-600">
              Delete Customer — {selectedCustomer?.fullName}
            </h3>

            <p className="text-sm">
              This will remove customer + visits + invite code.
            </p>

            <button
              onClick={applyDelete}
              className="w-full bg-red-600 text-white p-2 rounded-lg"
            >
              Delete
            </button>

            <button
              onClick={() => setDeleteOpen(false)}
              className="w-full p-2 text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Visit history */}
      {visitModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px] max-h-[80vh] overflow-y-auto space-y-3">
            <h3 className="text-lg font-semibold mb-2">
              Visit History — {selectedCustomer?.fullName}
            </h3>

            {selectedVisits.length === 0 && <p>No visits found.</p>}

            {selectedVisits.map((v: any) => (
              <div key={v.id} className="border-b pb-2">
                <p><b>Check-in:</b> {new Date(v.checkInAt).toLocaleString()}</p>
                {v.checkOutAt && (
                  <p><b>Check-out:</b> {new Date(v.checkOutAt).toLocaleString()}</p>
                )}
                <p><b>Service:</b> {v.service || "-"}</p>
                <p><b>Heard:</b> {v.heard || "-"}</p>
                <p><b>Points:</b> {v.pointsAwarded}</p>
              </div>
            ))}

            <button
              onClick={() => setVisitModalOpen(false)}
              className="w-full p-2 text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
