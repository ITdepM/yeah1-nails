"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Modal from "../../components/Modal";

export default function CustomerProfile() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [visits, setVisits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  async function loadData() {
    setLoading(true);
    const res = await fetch(`/api/admin/customer?id=${customerId}`);
    const data = await res.json();

    setCustomer(data.customer);
    setVisits(data.visits);
    setLogs(data.logs);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!customer) return <p className="p-6">Customer not found.</p>;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/customers")}
          className="text-blue-600 underline"
        >
          ← Back to Customers
        </button>

        {/* CUSTOMER HEADER */}
        <div className="bg-white rounded-xl shadow p-6 space-y-2 border">
          <h1 className="text-3xl font-bold text-rose-600">
            {customer.fullName}
          </h1>

          <p className="text-gray-600">📱 {customer.phone}</p>

          <p>
            <b>Invite Code:</b>{" "}
            <span className="px-2 py-1 bg-rose-100 rounded text-rose-700">
              {customer.inviteCode?.code || "-"}
            </span>
          </p>

          <p>
            <b>Referred By:</b>{" "}
            {customer.invitedBy
              ? `${customer.invitedBy.fullName} (${customer.invitedBy.phone})`
              : "-"}
          </p>

          <p>
            <b>Referral Count:</b> {customer.referrals?.length || 0}
          </p>

          <p>
            <b>Signup Date:</b>{" "}
            {new Date(customer.createdAt).toLocaleDateString()}
          </p>

          <p>
            <b>Total Points:</b>{" "}
            <span className="font-bold text-green-700">
              {customer.totalPoints}
            </span>
          </p>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setAdjustOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Adjust Points
            </button>

            <button
              onClick={() => setRedeemOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Redeem 150 pts
            </button>

            <button
              onClick={() => setDeleteOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Delete Customer
            </button>
          </div>
        </div>

        {/* VISIT HISTORY */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-3">Visit History</h2>

          {visits.length === 0 ? (
            <p>No visit records.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Check-in</th>
                  <th className="p-2">Check-out</th>
                  <th className="p-2">Service</th>
                  <th className="p-2">Heard</th>
                  <th className="p-2">Points</th>
                </tr>
              </thead>

              <tbody>
                {visits.map((v: any) => (
                  <tr key={v.id} className="border-b">
                    <td className="p-2">
                      {new Date(v.checkInAt).toLocaleString()}
                    </td>
                    <td className="p-2">
                      {v.checkOutAt
                        ? new Date(v.checkOutAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-2">{v.service || "-"}</td>
                    <td className="p-2">{v.heard || "-"}</td>
                    <td className="p-2">{v.pointsAwarded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* POINTS / ACTIVITY LOG */}
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="text-xl font-semibold mb-3">Points Activity</h2>

          {logs.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {logs.map((log: any) => (
                <div key={log.id} className="border-b py-2 text-sm">
                  <p>
                    <b>{log.action}</b> — {log.details}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODALS */}

        {/* ADJUST */}
        <Modal
          open={adjustOpen}
          title="Adjust Points"
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
            onClick={async () => {
              await fetch("/api/admin/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerId,
                  amount: Number(adjustAmount),
                }),
              });

              setAdjustOpen(false);
              loadData();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
          >
            Apply Adjustment
          </button>
        </Modal>

        {/* REDEEM */}
        <Modal
          open={redeemOpen}
          title="Redeem Points"
          onClose={() => setRedeemOpen(false)}
        >
          <p>Redeem 150 points?</p>

          <button
            onClick={async () => {
              await fetch("/api/admin/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId }),
              });

              setRedeemOpen(false);
              loadData();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
          >
            Confirm Redeem
          </button>
        </Modal>

        {/* DELETE */}
        <Modal
          open={deleteOpen}
          title="Delete Customer"
          onClose={() => setDeleteOpen(false)}
        >
          <p className="mb-3">⚠️ This will permanently delete all data.</p>

          <button
            onClick={async () => {
              await fetch("/api/admin/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId }),
              });

              router.push("/admin/customers");
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
          >
            Confirm Delete
          </button>
        </Modal>
      </main>
    </div>
  );
}
