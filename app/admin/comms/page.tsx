import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Mail, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default async function AdminCommsLogPage() {
  const supabase = createClient();
  
  const { data: logs } = await supabase
    .from('notification_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Communication Audit Log</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Monitor email and WhatsApp notifications sent to users.</p>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event / Channel</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference (Sub-Order)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(!logs || logs.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No communication logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {log.channel === 'whatsapp' ? <MessageCircle size={16} className="text-green-500" /> : <Mail size={16} className="text-blue-500" />}
                        <span className="text-sm font-medium text-gray-900">{log.event_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="truncate max-w-[200px]" title={log.recipient_id}>{log.recipient_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.sub_order_id !== 'N/A' ? (
                        <div className="truncate max-w-[150px]" title={log.sub_order_id}>{log.sub_order_id.split('-')[0]}...</div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 size={12} /> Success
                        </span>
                      ) : log.status === 'failed' ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle size={12} /> Failed
                          </span>
                          {log.error_message && (
                            <span className="text-xs text-red-500 truncate max-w-[200px]" title={log.error_message}>
                              {log.error_message}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {log.status}
                        </span>
                      )}
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
