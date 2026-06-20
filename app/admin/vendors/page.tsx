'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye } from 'lucide-react';

type Vendor = {
  id: string;
  business_name: string;
  gstin: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  submitted_at: string;
  profiles: {
    full_name: string;
    phone: string;
    created_at: string;
  };
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vendors');
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const data = await res.json();
      setVendors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading vendors...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Vendor Management</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Review applications and manage active vendors.</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GSTIN</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No vendors found.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.business_name || 'Unnamed Business'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.profiles?.full_name}</div>
                      <div className="text-sm text-gray-500">{vendor.profiles?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.gstin || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase
                        ${vendor.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${vendor.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${vendor.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                        ${vendor.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        ${vendor.status === 'suspended' ? 'bg-orange-100 text-orange-800' : ''}
                      `}>
                        {vendor.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.submitted_at 
                        ? new Date(vendor.submitted_at).toLocaleDateString()
                        : new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/admin/vendors/${vendor.id}`}
                        className="inline-flex items-center gap-1 text-black hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md"
                      >
                        <Eye size={16} />
                        {vendor.status === 'under_review' ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
