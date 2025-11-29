"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setSettings(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    alert("Settings updated!");
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-rose-600">App Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border shadow-sm">

        {[
          ["signupBonus", "Sign-up Bonus (+)"],
          ["checkoutBonus", "Checkout Bonus (+)"],
          ["referralBonus", "Referral Bonus (inviter only)"],
          ["redeemCost", "Redeem Cost (points)"],
          ["maxReferralUses", "Max Referral Uses"]
        ].map(([key, label]) => (
          <div key={key}>
            <label className="font-semibold">{label}</label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg mt-1"
              value={settings[key]}
              onChange={(e) =>
                setSettings({ ...settings, [key]: Number(e.target.value) })
              }
            />
          </div>
        ))}

      </div>

      <button
        onClick={save}
        className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700"
      >
        Save Settings
      </button>
    </div>
  );
}
