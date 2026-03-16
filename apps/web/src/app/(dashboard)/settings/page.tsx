"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pos-settings";

interface PosSettings {
  taxRate: number;
  currencySymbol: string;
}

const DEFAULT_SETTINGS: PosSettings = {
  taxRate: 0,
  currencySymbol: "$",
};

export default function SettingsPage() {
  const [taxRate, setTaxRate] = useState(DEFAULT_SETTINGS.taxRate);
  const [currencySymbol, setCurrencySymbol] = useState(DEFAULT_SETTINGS.currencySymbol);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PosSettings = JSON.parse(raw);
        setTaxRate(parsed.taxRate ?? DEFAULT_SETTINGS.taxRate);
        setCurrencySymbol(parsed.currencySymbol ?? DEFAULT_SETTINGS.currencySymbol);
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const settings: PosSettings = { taxRate, currencySymbol };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              id="taxRate"
              type="number"
              step={0.01}
              min={0}
              max={100}
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 mb-1">
              Currency Symbol
            </label>
            <input
              id="currencySymbol"
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            {successMsg && (
              <span className="text-sm text-green-600 font-medium">Settings saved!</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
