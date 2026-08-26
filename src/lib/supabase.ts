import { createClient } from '@supabase/supabase-js';
import {
  User,
  UserRole,
  ServiceRequest,
  SupportTicket,
  HoldingDepositRequest,
  HoldingWithdrawRequest,
  RolePermissions,
  Notification,
  AuditLog,
  Comment,
  Attachment,
  RequestStatus,
  RequestPriority,
  PageId,
} from '../types';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ── Security: keep the JWT in memory only (not localStorage) ──────────
    // persistSession: false prevents the access_token / refresh_token from
    // being written to localStorage where XSS scripts could read it.
    // Trade-off: the session ends when the tab is closed (no cross-tab
    // persistence). autoRefreshToken still silently renews the JWT while the
    // tab is open. detectSessionInUrl handles magic-link / OAuth redirects.
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// -------------------------------------------------------------
// Type mappers (DB Snake_Case <-> Frontend CamelCase)
// -------------------------------------------------------------

export function mapDbUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url,
    companyName: row.company_name,
    phoneNumber: row.phone_number,
    account: row.account || '',
    ifsc: row.ifsc || '',
    bank: row.bank || '',
    estimatedHoldingBalance: row.estimated_holding_balance ? Number(row.estimated_holding_balance) : 0,
    currency: row.currency || 'INR',
    status: row.status || 'active',
    createdAt: row.created_at,
  };
}

export function mapUserToDb(u: User): any {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar_url: u.avatarUrl,
    company_name: u.companyName,
    phone_number: u.phoneNumber,
    account: u.account || null,
    ifsc: u.ifsc || null,
    bank: u.bank || null,
    estimated_holding_balance: u.estimatedHoldingBalance,
    currency: u.currency,
    status: u.status,
    created_at: u.createdAt,
  };
}

export function mapDbRequest(row: any): ServiceRequest {
  const base: any = {
    id: row.id,
    ticketNumber: row.ticket_number,
    type: row.type,
    title: row.title,
    description: row.description || '',
    status: row.status as RequestStatus,
    priority: row.priority as RequestPriority,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientCompany: row.client_company,
    assignedOperatorId: row.assigned_operator_id,
    assignedOperatorName: row.assigned_operator_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    deleteRequested: Boolean(row.delete_requested),
    deleteRequestedBy: row.delete_requested_by || undefined,
    deleteRequestedById: row.delete_requested_by_id || undefined,
    deleteRequestedReason: row.delete_requested_reason || undefined,
    deleteRequestedAt: row.delete_requested_at || undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    comments: Array.isArray(row.comments)
      ? row.comments.map((c: any) => ({
        id: c.id || `cm_${Date.now()}`,
        authorId: c.authorId || c.author_id || 'usr_system',
        authorName: c.authorName || c.author_name || 'System User',
        authorRole: c.authorRole || c.author_role || 'client',
        authorAvatar: c.authorAvatar || c.author_avatar,
        content: c.content || '',
        isInternal: c.isInternal !== undefined ? c.isInternal : (c.is_internal !== undefined ? c.is_internal : false),
        createdAt: c.createdAt || c.created_at || (row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()),
        attachments: Array.isArray(c.attachments) ? c.attachments : [],
      }))
      : [],
  };

  if (row.type === 'support') {
    return {
      ...base,
      type: 'support',
      category: row.category || 'matm',
      remoteId: row.remote_id || row.remoteId || row.remote_type,
      environment: row.environment,
      browserInfo: row.browser_info,
    } as SupportTicket;
  }

  if (row.type === 'deposit') {
    return {
      ...base,
      type: 'deposit',
      amount: row.amount ? Number(row.amount) : 0,
      currency: row.currency || 'USD',
      depositMethod: row.deposit_method || 'bank_wire',
      transactionReferenceId: row.transaction_reference_id || '',
      senderAccountName: row.sender_account_name,
      depositDate: row.deposit_date || new Date().toISOString().split('T')[0],
      destinationAccount: row.destination_account || '',
      verifiedTransactionId: row.verified_transaction_id,
    } as HoldingDepositRequest;
  }

  return {
    ...base,
    type: 'withdraw',
    amount: row.amount ? Number(row.amount) : 0,
    currency: row.currency || 'USD',
    withdrawMethod: row.withdraw_method || 'bank_wire',
    beneficiaryAccountName: row.beneficiary_account_name || '',
    // schema column is beneficiary_account_number (not ...or_address)
    beneficiaryAccountNumberOrAddress: row.beneficiary_account_number || '',
    // schema column is bank_name (not bank_name_or_network)
    bankNameOrNetwork: row.bank_name,
    // schema column is bank_ifsc (not swift_or_iban)
    swiftOrIban: row.bank_ifsc,
    reason: row.reason,
    transferReceiptRef: row.transfer_receipt_ref,
    cmaStatus: row.cma_status || undefined,
    authorizedAmount: row.cma_status?.authorizedAmount || (row.authorized_amount ? Number(row.authorized_amount) : undefined),
  } as HoldingWithdrawRequest;
}

export function mapRequestToDb(req: ServiceRequest): any {
  const dbReq: any = {
    id: req.id,
    ticket_number: req.ticketNumber,
    type: req.type,
    title: req.title,
    description: req.description,
    status: req.status,
    priority: req.priority,
    client_id: req.clientId,
    client_name: req.clientName,
    client_email: req.clientEmail,
    client_company: req.clientCompany,
    assigned_operator_id: req.assignedOperatorId,
    assigned_operator_name: req.assignedOperatorName,
    attachments: req.attachments || [],
    comments: (req.comments || []).map((c: any) => {
      const ts = c.createdAt || c.created_at || new Date().toISOString();
      return {
        id: c.id,
        authorId: c.authorId || c.author_id,
        authorName: c.authorName || c.author_name,
        authorRole: c.authorRole || c.author_role,
        authorAvatar: c.authorAvatar || c.author_avatar,
        content: c.content,
        isInternal: c.isInternal !== undefined ? c.isInternal : (c.is_internal !== undefined ? c.is_internal : false),
        createdAt: ts,
        created_at: ts,
        attachments: c.attachments || [],
      };
    }),
    created_at: req.createdAt,
    updated_at: req.updatedAt,
    resolved_at: req.resolvedAt || null,
    delete_requested: Boolean(req.deleteRequested),
    delete_requested_by: req.deleteRequestedBy || null,
    delete_requested_by_id: req.deleteRequestedById || null,
    delete_requested_reason: req.deleteRequestedReason || null,
    delete_requested_at: req.deleteRequestedAt || null,
  };

  if (req.type === 'support') {
    const sReq = req as SupportTicket;
    dbReq.category = sReq.category;
    dbReq.remote_id = sReq.remoteId;
    dbReq.browser_info = sReq.browserInfo;
  } else if (req.type === 'deposit') {
    const dReq = req as HoldingDepositRequest;
    dbReq.amount = dReq.amount;
    dbReq.currency = dReq.currency;
    dbReq.deposit_method = dReq.depositMethod;
    dbReq.transaction_reference_id = dReq.transactionReferenceId;
    dbReq.sender_account_name = dReq.senderAccountName;
    dbReq.deposit_date = dReq.depositDate;
    dbReq.verified_transaction_id = dReq.verifiedTransactionId;
  } else if (req.type === 'withdraw') {
    const wReq = req as HoldingWithdrawRequest;
    dbReq.amount = wReq.amount;
    dbReq.currency = wReq.currency;
    dbReq.withdraw_method = wReq.withdrawMethod;
    dbReq.beneficiary_account_name = wReq.beneficiaryAccountName;
    // Use schema column name: beneficiary_account_number
    dbReq.beneficiary_account_number = wReq.beneficiaryAccountNumberOrAddress;
    // Use schema column name: bank_name
    dbReq.bank_name = wReq.bankNameOrNetwork;
    // Use schema column name: bank_ifsc
    dbReq.bank_ifsc = wReq.swiftOrIban;
    dbReq.reason = wReq.reason;
    dbReq.transfer_receipt_ref = wReq.transferReceiptRef;
    dbReq.cma_status = wReq.cmaStatus || null;
    dbReq.authorized_amount = wReq.authorizedAmount || wReq.cmaStatus?.authorizedAmount || null;
  }

  return dbReq;
}

export function mapDbAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role as UserRole,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    details: row.details,
    timestamp: row.timestamp,
    ipAddress: row.ip_address,
  };
}

export function mapAuditLogToDb(log: AuditLog): any {
  return {
    id: log.id,
    actor_id: log.actorId,
    actor_name: log.actorName,
    actor_role: log.actorRole,
    action: log.action,
    target_type: log.targetType,
    target_id: log.targetId,
    details: log.details,
    timestamp: log.timestamp,
    ip_address: log.ipAddress,
  };
}

export function mapDbNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    category: row.category,
    requestId: row.request_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

export function mapNotificationToDb(n: Notification): any {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    category: n.category,
    request_id: n.requestId,
    is_read: n.isRead,
    created_at: n.createdAt,
  };
}

// -------------------------------------------------------------
// API / Database Operations
// -------------------------------------------------------------

export async function fetchUsersFromSupabase(): Promise<User[]> {
  const { data, error } = await supabase.from('csmp_users').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapDbUser);
}

export async function deleteUserFromSupabase(userId: string): Promise<void> {
  const { error } = await supabase.from('csmp_users').delete().eq('id', userId);
  if (error) throw error;
}

export async function fetchRequestsFromSupabase(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase.from('csmp_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbRequest);
}

export async function saveRequestToSupabase(req: ServiceRequest): Promise<void> {
  const payload = mapRequestToDb(req);
  const { error } = await supabase.from('csmp_requests').upsert(payload, { onConflict: 'id' });
  if (error) {
    console.warn('Initial Supabase upsert error:', error.message, error.details || '');
    // Graceful fallback: strip columns that may not yet exist in older schema deployments
    const fallbackPayload = { ...payload };
    delete fallbackPayload.cma_status;
    delete fallbackPayload.authorized_amount;
    delete fallbackPayload.transfer_receipt_ref;
    delete fallbackPayload.resolved_at;
    delete fallbackPayload.client_company;
    delete fallbackPayload.delete_requested;
    delete fallbackPayload.delete_requested_by;
    delete fallbackPayload.delete_requested_by_id;
    delete fallbackPayload.delete_requested_reason;
    delete fallbackPayload.delete_requested_at;
    const retry = await supabase.from('csmp_requests').upsert(fallbackPayload, { onConflict: 'id' });
    if (retry.error) {
      console.error('Supabase request upsert fallback error:', retry.error.message, retry.error.details || '');
      throw retry.error;
    }
    return;
  }
}

export async function updateRequestInSupabase(reqId: string, updates: Partial<any>): Promise<void> {
  const { error } = await supabase.from('csmp_requests').update(updates).eq('id', reqId);
  if (error) throw error;
}

export async function deleteRequestFromSupabase(reqId: string): Promise<void> {
  const { error } = await supabase.from('csmp_requests').delete().eq('id', reqId);
  if (error) throw error;
}

export async function fetchPermissionsFromSupabase(): Promise<Record<UserRole, RolePermissions> | null> {
  const { data, error } = await supabase.from('csmp_role_permissions').select('*');
  if (error || !data || data.length === 0) return null;

  const result: any = {};
  data.forEach((row: any) => {
    result[row.role] = {
      role: row.role as UserRole,
      allowedPages: (row.allowed_pages || []) as PageId[],
      canCreateRequest: Boolean(row.can_create_request),
      canChangeStatus: Boolean(row.can_change_status),
      canAssignOperator: Boolean(row.can_assign_operator),
      canAddInternalNotes: Boolean(row.can_add_internal_notes),
      canViewAllClients: Boolean(row.can_view_all_clients),
      canManageRoles: Boolean(row.can_manage_roles),
      canExportReports: Boolean(row.can_export_reports),
      canViewAuditLogs: Boolean(row.can_view_audit_logs),
    };
  });
  return result;
}

export async function savePermissionsToSupabase(role: UserRole, perms: RolePermissions): Promise<void> {
  const payload = {
    role,
    allowed_pages: perms.allowedPages,
    can_create_request: perms.canCreateRequest,
    can_change_status: perms.canChangeStatus,
    can_assign_operator: perms.canAssignOperator,
    can_add_internal_notes: perms.canAddInternalNotes,
    can_view_all_clients: perms.canViewAllClients,
    can_manage_roles: perms.canManageRoles,
    can_export_reports: perms.canExportReports,
    can_view_audit_logs: perms.canViewAuditLogs,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('csmp_role_permissions').upsert(payload, { onConflict: 'role' });
  if (error) throw error;
}

export async function fetchNotificationsFromSupabase(): Promise<Notification[]> {
  const { data, error } = await supabase.from('csmp_notifications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbNotification);
}

export async function saveNotificationToSupabase(n: Notification): Promise<void> {
  const payload = mapNotificationToDb(n);
  const { error } = await supabase.from('csmp_notifications').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function markNotificationReadInSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('csmp_notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsReadInSupabase(userId: string): Promise<void> {
  const { error } = await supabase
    .from('csmp_notifications')
    .update({ is_read: true })
    .or(`user_id.eq.${userId},user_id.eq.all_operators,user_id.eq.all_admins`);
  if (error) throw error;
}

export async function fetchAuditLogsFromSupabase(): Promise<AuditLog[]> {
  const { data, error } = await supabase.from('csmp_audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  if (error) throw error;
  return (data || []).map(mapDbAuditLog);
}

export async function saveAuditLogToSupabase(log: AuditLog): Promise<void> {
  const payload = mapAuditLogToDb(log);
  const { error } = await supabase.from('csmp_audit_logs').insert(payload);
  if (error) throw error;
}

// -------------------------------------------------------------
// Health Check & Diagnostic
// -------------------------------------------------------------

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  latencyMs: number;
  error?: string;
  tables?: { users: number; requests: number; auditLogs: number };
}> {
  const start = performance.now();
  try {
    const [usersRes, reqsRes, auditRes] = await Promise.all([
      supabase.from('csmp_users').select('*', { count: 'exact', head: true }),
      supabase.from('csmp_requests').select('*', { count: 'exact', head: true }),
      supabase.from('csmp_audit_logs').select('*', { count: 'exact', head: true }),
    ]);

    if (usersRes.error) throw usersRes.error;
    if (reqsRes.error) throw reqsRes.error;
    if (auditRes.error) throw auditRes.error;

    const latencyMs = Math.round(performance.now() - start);

    return {
      connected: true,
      latencyMs,
      tables: {
        users: usersRes.count || 0,
        requests: reqsRes.count || 0,
        auditLogs: auditRes.count || 0,
      },
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      latencyMs,
      // Sanitize: never expose raw DB error messages to the UI
      error: 'Could not reach database. Check your connection or Supabase project status.',
    };
  }
}
