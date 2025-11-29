"use client";

import { useState, useEffect } from "react";

export default function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | today | week | month

  async function loadVisits() {
    setLoading(true);

    const res = await fetch(
      `/api/admin/visits/all?search=${search}&filter=${filter}`
    );

    const data = await res.json();
    setVisits(data.visits);
    setLoading(false);
  }

  useEffect(() => {
    loadVisits();
  }, [search, filter]);

  // Badge component
  function StatusBadge({ hasCheckout }: { hasCheckout: boolean }) {
    return hasCheckout ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
        Checked Out
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
        Still Inside
      </span>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-rose-600 mb-4">Visits</h1>

      {/* SEARCH BAR */}
      <input
        className="border p-2 rounded-lg w-full mb-3"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-4">
        {[
          { label: "All", value: "all" },
          { label: "Today", value: "today" },
          { label: "Last 7 Days", value: "week" },
          { label: "Last 30 Days", value: "month" },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-3 py-1 rounded-lg border ${
              filter === btn.value ? "bg-rose-600 text-white" : "bg-white"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* VISITS TABLE */}
      <div className="bg-white border rounded-xl shadow-sm p-4 overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Check-In</th>
                <th className="p-2">Check-Out</th>
                <th className="p-2">Status</th>
                <th className="p-2">Points</th>
              </tr>
            </thead>

            <tbody>
              {visits.map((v: any) => (
                <tr key={v.id} className="border-b">
                  <td className="p-2">{v.customer?.fullName || "-"}</td>
                  <td className="p-2">{v.customer?.phone || "-"}</td>
                  <td className="p-2">
                    {new Date(v.checkInAt).toLocaleString()}
                  </td>
                  <td className="p-2">
                    {v.checkOutAt
                      ? new Date(v.checkOutAt).toLocaleString()
                      : "-"}
                  </td>

                  <td className="p-2">
                    <StatusBadge hasCheckout={!!v.checkOutAt} />
                  </td>

                  <td className="p-2">{v.pointsAwarded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
