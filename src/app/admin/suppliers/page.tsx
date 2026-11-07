'use client';

import React, { useState, useEffect } from 'react';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierOrders, setSupplierOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers);
        setSupplierOrders(data.supplierOrders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePO = async (poId: string, status: string) => {
    const tracking = prompt('Enter courier tracking number (or leave blank):');
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId, status, trackingNumber: tracking }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSuppliers();
      }
    } catch (e) {
      alert('Error updating PO');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-gray-500">
        Loading supplier fulfillment records...
      </div>
    );
  }

  const deodap = suppliers[0] || {
    name: 'DeoDap Wholesale',
    code: 'DEODAP',
    email: 'care@deodap.com',
    phone: '+91 96246 66631',
    address: 'Rajkot, Gujarat, India',
    status: 'ACTIVE',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-orange-600" /> Dropshipping Supplier Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Supplier verification, automatic purchase orders, wholesale cost records, and fulfillment tracking.
          </p>
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> DeoDap Supplier Integration Active
        </span>
      </div>

      {/* Supplier Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg">
              DD
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{deodap.name}</h2>
              <p className="text-xs text-gray-500">Primary Product Catalogue Supplier</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            ● {deodap.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-semibold block text-[10px]">Warehouse Hub</span>
            <p className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" /> {deodap.address}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-semibold block text-[10px]">Supplier Contact</span>
            <p className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-orange-600" /> {deodap.phone}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 font-semibold block text-[10px]">Catalog Source</span>
            <p className="font-bold text-gray-800 mt-0.5">
              All Products-29-8-26.pdf (4,889 items)
            </p>
          </div>
        </div>
      </div>

      {/* Supplier Purchase Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider">
            Supplier Fulfillment Requests (Purchase Orders)
          </h3>
          <span className="text-xs text-gray-500">{supplierOrders.length} PO entries</span>
        </div>

        {supplierOrders.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No supplier orders generated yet. Customer orders automatically generate supplier POs.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">PO Number</th>
                  <th className="py-2.5 px-3">Supplier Wholesale Cost</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tracking / Courier</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplierOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-gray-900">{po.poNumber}</td>
                    <td className="py-3 px-3 font-black text-red-700">{formatINR(po.totalCost)}</td>
                    <td className="py-3 px-3">
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {po.trackingNumber || <span className="text-gray-400 italic">Pending</span>}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{formatDate(po.createdAt)}</td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {po.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdatePO(po.id, 'CONFIRMED')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                        >
                          Confirm PO
                        </button>
                      )}
                      {po.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdatePO(po.id, 'DISPATCHED')}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                        >
                          Mark Dispatched
                        </button>
                      )}
                      {po.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleUpdatePO(po.id, 'DELIVERED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

