'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: 'BharatDrop',
    store_tagline: 'Apna Bharat, Apni Dukan - Best Dropship Prices',
    free_shipping_threshold: '499',
    standard_shipping_charge: '49',
    default_markup_percent: '75',
    cod_enabled: 'true',
    razorpay_enabled: 'true',
    razorpay_key_id: 'rzp_test_dropship2026',
    razorpay_key_secret: 'rzp_test_dropshipsecret2026',
    announcement_text: '🇮🇳 Festive Sale Live! Free Delivery on orders above ₹499 | Cash on Delivery Available',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) {
          setSettings((prev) => ({ ...prev, ...d.settings }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" /> Website & Dropshipping Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure store branding, default pricing markup formulas, shipping rates, and Indian payment gateways.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Store Identity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Store Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Store Name</label>
              <input
                type="text"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Tagline</label>
              <input
                type="text"
                value={settings.store_tagline || ''}
                onChange={(e) => handleChange('store_tagline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-semibold mb-1">Announcement Bar Text</label>
              <input
                type="text"
                value={settings.announcement_text || ''}
                onChange={(e) => handleChange('announcement_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Shipping */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Pricing & Shipping Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Default Markup Percentage (%)</label>
              <input
                type="number"
                value={settings.default_markup_percent || '75'}
                onChange={(e) => handleChange('default_markup_percent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={settings.free_shipping_threshold || '499'}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.standard_shipping_charge || '49'}
                onChange={(e) => handleChange('standard_shipping_charge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Payments Gateway */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Indian Payment Gateways
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpay_key_id || ''}
                onChange={(e) => handleChange('razorpay_key_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Razorpay Key Secret</label>
              <input
                type="password"
                value={settings.razorpay_key_secret || ''}
                onChange={(e) => handleChange('razorpay_key_secret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-orange-500 font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cod_enabled === 'true'}
                  onChange={(e) => handleChange('cod_enabled', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="font-bold text-gray-800">Enable Cash on Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.razorpay_enabled === 'true'}
                  onChange={(e) => handleChange('razorpay_enabled', e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="font-bold text-gray-800">Enable Razorpay UPI & Cards</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-sm text-xs"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Website Settings'}
        </button>
      </form>
    </div>
  );
}

