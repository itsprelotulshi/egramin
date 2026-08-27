import {
  User,
  UserRole,
  ServiceRequest,
  RolePermissions,
  Notification,
  AuditLog,
} from '../types';
import { formatDateTimeIST } from './dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: csmp_current_user_v1 is intentionally absent — the full User object
// (name, email, phone, bank details) is PII and must NOT be persisted to
// localStorage. It lives exclusively in React state, populated from the
// Supabase session on every page load.
const USERS_KEY = 'csmp_users_v1';        // Non-PII user cache (role, status, id only)
const REQUESTS_KEY = 'csmp_requests_v1';
const PERMISSIONS_KEY = 'csmp_permissions_v1';
const NOTIFICATIONS_KEY = 'csmp_notifications_v1';

// Audit logs are NOT stored in localStorage — they are fetched exclusively
// from Supabase to prevent tampering and PII leakage.

// ─────────────────────────────────────────────────────────────────────────────
// Non-PII user profile fields that are safe to cache locally for offline use.
// PII fields (email, name, phoneNumber, account, ifsc, bank) are deliberately
// excluded and will be populated from the live Supabase session.
// ─────────────────────────────────────────────────────────────────────────────
type SafeUserCache = Pick<
  User,
  'id' | 'role' | 'status' | 'companyName' | 'avatarUrl' | 'currency' | 'estimatedHoldingBalance' | 'createdAt'
>;

function stripPii(user: User): SafeUserCache {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    companyName: user.companyName,
    avatarUrl: user.avatarUrl,
    currency: user.currency,
    estimatedHoldingBalance: user.estimatedHoldingBalance,
    createdAt: user.createdAt,
  };
}

export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    allowedPages: ['dashboard', 'support', 'holding', 'all-requests', 'clients', 'analytics', 'rbac', 'audit-logs', 'notifications', 'settings'],
    canCreateRequest: false,
    canChangeStatus: true,
    canAssignOperator: true,
    canAddInternalNotes: true,
    canViewAllClients: true,
    canManageRoles: true,
    canExportReports: true,
    canViewAuditLogs: true,
  },
  operator: {
    role: 'operator',
    allowedPages: ['dashboard', 'support', 'holding', 'all-requests', 'clients', 'analytics', 'notifications'],
    canCreateRequest: false,
    canChangeStatus: true,
    canAssignOperator: true,
    canAddInternalNotes: true,
    canViewAllClients: true,
    canManageRoles: false,
    canExportReports: true,
    canViewAuditLogs: false,
  },
  client: {
    role: 'client',
    allowedPages: ['dashboard', 'support', 'holding'],
    canCreateRequest: true,
    canChangeStatus: false,
    canAssignOperator: false,
    canAddInternalNotes: false,
    canViewAllClients: false,
    canManageRoles: false,
    canExportReports: false,
    canViewAuditLogs: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Users — non-PII cache only
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the locally cached user list. Only non-PII operational fields
 * (id, role, status, companyName, avatarUrl, currency, estimatedHoldingBalance)
 * are stored. PII fields will be empty strings / undefined in the returned
 * objects — callers must populate them from the live Supabase session.
 */
export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as User[];
  } catch {
    // fallback
  }
  return [];
}

/**
 * Persists only the non-PII subset of each user to localStorage.
 * Strips email, name, phoneNumber, account, ifsc, bank before writing.
 */
export function saveUsers(users: User[]): void {
  const safe = users.map(stripPii);
  localStorage.setItem(USERS_KEY, JSON.stringify(safe));
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Requests
// ─────────────────────────────────────────────────────────────────────────────

export function getStoredRequests(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveRequests(requests: ServiceRequest[]): void {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Permissions
// ─────────────────────────────────────────────────────────────────────────────

export function getStoredPermissions(): Record<UserRole, RolePermissions> {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_PERMISSIONS;
}

export function savePermissions(perms: Record<UserRole, RolePermissions>): void {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
}

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export function getStoredNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveNotifications(notifs: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs — localStorage REMOVED
// ─────────────────────────────────────────────────────────────────────────────
// Audit logs are not persisted to localStorage (they contain PII such as actor
// names, emails, and action details). They are fetched exclusively from
// Supabase via fetchAuditLogsFromSupabase(). The functions below are kept as
// no-ops so that existing callers do not need to be refactored all at once.

/** @deprecated Audit logs are no longer persisted to localStorage. No-op. */
export function getStoredAuditLogs(): AuditLog[] {
  return [];
}

/** @deprecated Audit logs are no longer persisted to localStorage. No-op. */
export function saveAuditLogs(_logs: AuditLog[]): void {
  // Intentionally empty — audit logs live in Supabase only.
}

/**
 * Writes a structured audit event.
 * NOTE: This function now only delegates to the in-memory state; the actual
 * DB write is done by saveAuditLogToSupabase() in supabase.ts. The local
 * logAuditEvent helper is retained for call-site compatibility but no longer
 * writes to localStorage.
 */
export function logAuditEvent(
  actor: User,
  action: string,
  targetType: AuditLog['targetType'],
  targetId: string,
  details: string
): void {
  // No localStorage write — audit log persistence is handled exclusively by
  // saveAuditLogToSupabase() which is called alongside every logAuditEvent().
  void actor; void action; void targetType; void targetId; void details;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV Export
// ─────────────────────────────────────────────────────────────────────────────

export function exportRequestsToCSV(requests: ServiceRequest[], filename = 'client_service_requests.csv'): void {
  const headers = [
    'Ticket Number',
    'Type',
    'Title',
    'Status',
    'Priority',
    'Client Name',
    'Client Email',
    'Company',
    'Assigned Operator',
    'Amount',
    'Currency',
    'Method / Category',
    'Created Date',
    'Updated Date',
  ];

  const rows = requests.map(req => {
    let amount = '';
    let currency = '';
    let methodOrCat = '';

    if (req.type === 'support') {
      methodOrCat = req.category;
    } else if (req.type === 'deposit') {
      amount = String(req.amount);
      currency = req.currency;
      methodOrCat = req.depositMethod;
    } else if (req.type === 'withdraw') {
      amount = String(req.amount);
      currency = req.currency;
      methodOrCat = req.withdrawMethod;
    }

    return [
      `"${req.ticketNumber}"`,
      `"${req.type.toUpperCase()}"`,
      `"${req.title.replace(/"/g, '""')}"`,
      `"${req.status.toUpperCase()}"`,
      `"${req.priority.toUpperCase()}"`,
      `"${req.clientName}"`,
      `"${req.clientEmail}"`,
      `"${req.clientCompany || ''}"`,
      `"${req.assignedOperatorName || 'Unassigned'}"`,
      `"${amount}"`,
      `"${currency}"`,
      `"${methodOrCat}"`,
      `"${formatDateTimeIST(req.createdAt)}"`,
      `"${formatDateTimeIST(req.updatedAt)}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo / Reset
// ─────────────────────────────────────────────────────────────────────────────

export function resetToDemoData(): void {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(REQUESTS_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(DEFAULT_PERMISSIONS));
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wipes all sensitive data from localStorage on sign-out.
 * Call this whenever a session ends to prevent data leaking to
 * the next person who opens the browser.
 */
export function clearSensitiveStorage(): void {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(REQUESTS_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
  // Permissions are re-fetched from Supabase on each login. Without clearing,
  // stale or admin-modified RBAC rules could persist across sessions.
  localStorage.removeItem(PERMISSIONS_KEY);
  // Navigation state — cleared so the next session starts at home
  localStorage.removeItem('csmp_current_view');
  localStorage.removeItem('csmp_current_page');
  // Legacy key guard — remove in case old versions wrote it
  localStorage.removeItem('csmp_current_user_v1');
  localStorage.removeItem('csmp_auth_session_active');
  localStorage.removeItem('csmp_audit_logs_v1');
}
