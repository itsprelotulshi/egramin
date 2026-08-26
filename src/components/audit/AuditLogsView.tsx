import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { formatDateTimeIST } from '../../lib/dateUtils';
import {
  FileText,
  Search,
  ShieldCheck,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.targetId.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <div id="audit-logs-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Security Audit Trail & System Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of all service requests, operator assignments, status transitions, and role modifications.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Event Actions</option>
            <option value="CREATE_REQUEST">CREATE_REQUEST</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="ASSIGN_OPERATOR">ASSIGN_OPERATOR</option>
            <option value="ADD_COMMENT">ADD_COMMENT</option>
            <option value="PERMISSIONS_UPDATE">PERMISSIONS_UPDATE</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by actor, action, ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Actor</th>
                <th className="py-3 px-4 font-medium">Action Event</th>
                <th className="py-3 px-4 font-medium">Target Entity</th>
                <th className="py-3 px-4 font-medium">Details & Payload</th>
                <th className="py-3 pr-4 font-medium text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDateTimeIST(log.timestamp)}
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.actorName}</span>
                      <RoleBadge role={log.actorRole} />
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {log.action}
                    </span>
                  </td>

                  {/* Target Entity */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {log.targetType}: <span className="font-semibold">{log.targetId}</span>
                  </td>

                  {/* Details */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-sm truncate">
                    {log.details}
                  </td>

                  {/* IP */}
                  <td className="py-3.5 pr-4 text-right font-mono text-xs text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
