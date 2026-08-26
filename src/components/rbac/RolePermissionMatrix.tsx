import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, PageId, RolePermissions } from '../../types';
import { RoleBadge } from '../common/Badge';
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  RotateCcw,
  Sliders,
  AlertCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export const RolePermissionMatrix: React.FC = () => {
  const { permissions, updateRolePermission, togglePageForRole, toast } = useApp();
  const { user } = useAuth();

  if (user.role !== 'admin') {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Only users with the <span className="font-bold">Administrator</span> role can modify RBAC permissions and page routing matrices.
        </p>
      </div>
    );
  }

  const pages: { id: PageId; name: string; desc: string }[] = [
    { id: 'dashboard', name: 'Dashboard Overview', desc: 'KPI metrics, summary cards, and launchpad shortcuts' },
    { id: 'support', name: 'Technical Support Desk', desc: 'Category-filtered tickets, bug reports, and screenshot reviews' },
    { id: 'holding', name: 'Holding Update Requests', desc: 'Deposit confirmation slips and withdrawal payout requests' },
    { id: 'all-requests', name: 'All Service Requests', desc: 'Master directory table with multi-parameter filtering and search' },
    { id: 'clients', name: 'Client Directory (CRM)', desc: 'Client account list, holding balances, and portfolio histories' },
    { id: 'analytics', name: 'Analytics & SLA Reporting', desc: 'Recharts visualizations, operator workload, and volume trends' },
    { id: 'rbac', name: 'Role & RBAC Matrix', desc: 'Security access control matrix and page assignment engine' },
    { id: 'audit-logs', name: 'Audit Trail & Logs', desc: 'Immutable activity log capturing status transitions and logins' },
    { id: 'notifications', name: 'Notification Logs Center', desc: 'Real-time alert dispatch log, queue triggers, and client notifications' },
    { id: 'settings', name: 'Settings & Supabase Config', desc: 'Account credentials, simulated Supabase DB link, and JWT inspect' },
  ];

  const roles: UserRole[] = ['client', 'operator', 'admin'];

  const capabilities: { key: keyof RolePermissions; label: string; desc: string }[] = [
    { key: 'canCreateRequest', label: 'Create New Requests', desc: 'Allows submitting new technical support or holding update tickets' },
    { key: 'canChangeStatus', label: 'Update Request Status', desc: 'Can move status to In Progress, Completed, or Rejected' },
    { key: 'canAssignOperator', label: 'Assign / Route Operators', desc: 'Can assign support or holding requests to staff members' },
    { key: 'canAddInternalNotes', label: 'Add Internal Staff Notes', desc: 'Can write internal audit notes hidden from client view' },
    { key: 'canViewAllClients', label: 'Access Client CRM Profiles', desc: 'Can view client directory and external holding balances' },
    { key: 'canExportReports', label: 'Export Data to CSV', desc: 'Can download filtered request datasets to spreadsheet formats' },
    { key: 'canViewAuditLogs', label: 'Inspect Security Audit Logs', desc: 'Can review full audit trail and system events' },
  ];

  return (
    <div id="rbac-matrix-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Role-Based Access Control (RBAC) Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic page permissions and functional privileges per role in real time.
          </p>
        </div>
      </div>

      {/* Section 1: Page Navigation Matrix */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Page & View Access Permissions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select which sidebar navigation views are enabled for each role.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-medium">Application Page / View</th>
                {roles.map(r => (
                  <th key={r} className="py-3 px-4 font-medium text-center">
                    <div className="flex items-center justify-center">
                      <RoleBadge role={r} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{p.desc}</div>
                  </td>
                  {roles.map(r => {
                    const isAllowed = permissions[r].allowedPages.includes(p.id);
                    const isAdminLocked = r === 'admin' && (p.id === 'dashboard' || p.id === 'rbac');

                    return (
                      <td key={r} className="py-3 px-4 text-center">
                        <button
                          disabled={isAdminLocked}
                          onClick={() => togglePageForRole(r, p.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isAllowed
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200'
                          } ${isAdminLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isAdminLocked ? 'Mandatory for Administrator' : `Toggle ${p.name} for ${r}`}
                        >
                          {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Functional Action Capabilities Matrix */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Operational Action Capabilities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-grained privileges controlling status changes, operator routing, and internal notes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-medium">Functional Capability</th>
                {roles.map(r => (
                  <th key={r} className="py-3 px-4 font-medium text-center">
                    <div className="flex items-center justify-center">
                      <RoleBadge role={r} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {capabilities.map((cap) => (
                <tr key={cap.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{cap.label}</div>
                    <div className="text-[11px] text-slate-400">{cap.desc}</div>
                  </td>
                  {roles.map(r => {
                    const isAllowed = Boolean(permissions[r][cap.key]);
                    const isAdminLocked = r === 'admin';

                    return (
                      <td key={r} className="py-3 px-4 text-center">
                        <button
                          disabled={isAdminLocked}
                          onClick={() => updateRolePermission(r, { [cap.key]: !isAllowed })}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            isAllowed
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200'
                          } ${isAdminLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isAdminLocked ? 'Administrator retains full capability' : `Toggle ${cap.label} for ${r}`}
                        >
                          {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
