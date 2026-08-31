import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  DbUser,
  DbUserInsert,
  DbRequest,
  DbRequestInsert,
  DbRolePermission,
  DbRolePermissionInsert,
  DbNotification,
  DbNotificationInsert,
  DbAuditLog,
  DbAuditLogInsert,
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
} from '../types/app.type';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http')
);

// If Supabase credentials are configured via environment variables, initialize the live client.
// Otherwise, export a safe mock proxy to prevent startup crashes when running in offline/demo mode.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
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
  })
  : (new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({
              data: {
                subscription: {
                  unsubscribe: () => { },
                },
              },
            }),
            refreshSession: async () => ({
              data: { session: null, user: null },
              error: new Error('env configuration error'),
            }),
            signInWithPassword: async () => ({
              data: { session: null, user: null },
              error: new Error('env configuration error'),
            }),
            signUp: async () => ({
              data: { session: null, user: null },
              error: new Error('env configuration error'),
            }),
            signInWithOtp: async () => ({
              data: {},
              error: new Error('env configuration error'),
            }),
            resetPasswordForEmail: async () => ({
              data: {},
              error: new Error('env configuration error'),
            }),
            signOut: async () => ({ error: null }),
            updateUser: async () => ({
              data: { user: null },
              error: new Error('env configuration error'),
            }),
          };
        }
        if (prop === 'from') {
          return () => {
            const builder: any = {
              select: () => builder,
              order: () => builder,
              limit: () => builder,
              eq: () => builder,
              or: () => builder,
              upsert: async () => ({ data: null, error: new Error('env configuration error') }),
              insert: async () => ({ data: null, error: new Error('env configuration error') }),
              update: () => builder,
              delete: () => builder,
              then: (resolve: any) => resolve({ data: [], error: null }),
            };
            return builder;
          };
        }
        if (prop === 'channel' || prop === 'removeChannel') {
          return () => ({
            on: () => ({ subscribe: () => ({}) }),
            subscribe: () => ({}),
            unsubscribe: () => { },
          });
        }
        return () => { };
      },
    }
  ) as unknown as SupabaseClient);

// -------------------------------------------------------------
// Direct API / Database Operations (Supabase Schema Types)
// -------------------------------------------------------------

export async function fetchUsersFromSupabase(): Promise<User[]> {
  const { data, error } = await supabase.from('csmp_users').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as User[];
}

export async function saveUserToSupabase(user: DbUserInsert | any): Promise<void> {
  const { error } = await supabase.from('csmp_users').upsert(user, { onConflict: 'email' });
  if (error) throw error;
}

export async function deleteUserFromSupabase(userId: string): Promise<void> {
  const { error } = await supabase.from('csmp_users').delete().eq('id', userId);
  if (error) throw error;
}

export async function fetchRequestsFromSupabase(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase.from('csmp_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ServiceRequest[];
}

// -------------------------------------------------------------
// Collision-resistant identifiers & ticket numbers
// -------------------------------------------------------------
export function generateRequestId(prefix = 'req'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateTicketNumber(type: string, counter: number): string {
  const prefix = type === 'support' ? 'TCK' : 'HLD';
  const offset = type === 'support' ? 101 : type === 'deposit' ? 201 : 301;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${new Date().getFullYear()}-${counter + offset}-${suffix}`;
}

// Lightweight in-memory queue for requests whose Supabase write failed
const pendingSyncQueue: any[] = [];

export function queueRequestForRetry(req: any): void {
  if (!pendingSyncQueue.some(r => r.id === req.id)) pendingSyncQueue.push(req);
}

export async function flushPendingRequestSync(): Promise<void> {
  for (const req of [...pendingSyncQueue]) {
    try {
      await saveRequestToSupabase(req);
      pendingSyncQueue.splice(pendingSyncQueue.indexOf(req), 1);
    } catch (err: any) {
      console.warn(`Still unable to sync ${req.ticket_number || req.ticketNumber}:`, err.message);
    }
  }
}

export async function saveRequestToSupabase(req: DbRequestInsert | any): Promise<void> {
  const ticketNumber = req.ticket_number || req.ticketNumber;
  const attempt = (tNum: string) =>
    supabase.from('csmp_requests').upsert(
      { ...req, ticket_number: tNum },
      { onConflict: 'id' }
    );

  let { error } = await attempt(ticketNumber);
  if (error) {
    console.warn('Initial Supabase upsert error:', error.message, error.details || '');
    if (error.message && /unique|duplicate/i.test(error.message)) {
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const collisionRetry = await attempt(`${ticketNumber}-${suffix}`);
      if (!collisionRetry.error) return;
      error = collisionRetry.error;
      console.warn('Ticket-number collision retry failed:', error.message);
    }
    const fallbackPayload: any = { ...req };
    delete fallbackPayload.cma_status;
    delete fallbackPayload.authorized_amount;
    delete fallbackPayload.transfer_receipt_ref;
    delete fallbackPayload.resolved_at;
    delete fallbackPayload.client_company;
    delete fallbackPayload.beneficiary_account_number;
    delete fallbackPayload.bank_name;
    delete fallbackPayload.bank_ifsc;
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

export const INITIAL_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
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

export async function fetchPermissionsFromSupabase(): Promise<Record<UserRole, RolePermissions> | null> {
  return INITIAL_ROLE_PERMISSIONS;
}

export async function savePermissionsToSupabase(_role: UserRole, _perms: RolePermissions): Promise<void> {
  // Hardcoded permissions array used - no-op for database writes
}

export async function fetchNotificationsFromSupabase(): Promise<Notification[]> {
  const { data, error } = await supabase.from('csmp_notifications').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Notification[];
}

export async function saveNotificationToSupabase(n: DbNotificationInsert | any): Promise<void> {
  const { error } = await supabase.from('csmp_notifications').upsert(n, { onConflict: 'id' });
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
  return (data || []) as AuditLog[];
}

export async function saveAuditLogToSupabase(log: DbAuditLogInsert | any): Promise<void> {
  const { error } = await supabase.from('csmp_audit_logs').insert(log);
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
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      latencyMs: 0,
      error: 'Supabase credentials are not configured or using placeholder values.',
    };
  }
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

// -------------------------------------------------------------
// STORAGE: Request attachments
// -------------------------------------------------------------
const ATTACHMENT_BUCKET = 'csmp-attachments';

function sanitizeAttachmentName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80) || 'file';
}

/**
 * Upload a set of files to the `csmp-attachments` Storage bucket and return
 * Attachment records (public URLs) ready to store on a request.
 *
 * Falls back to local data-URL attachments when Supabase is not configured or
 * the upload fails, so the client UI never hard-crashes on a storage outage.
 */
export type UploadableAttachment =
  | File
  | Attachment
  | { name: string; size: number; type: string; url: string; file?: File };

/** Resolve the raw bytes to upload, if any, from a local record or File. */
function resolveSourceFile(f: UploadableAttachment): File | null {
  if (f instanceof File) return f;
  const maybe = (f as { file?: File }).file;
  return maybe || null;
}

export async function uploadAttachmentsToSupabase(
  ownerId: string,
  files: UploadableAttachment[],
): Promise<Attachment[]> {
  const uploaded: Attachment[] = [];
  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured) {
    // Offline/demo: keep in-memory data URLs (no real Storage).
    for (const f of files) {
      uploaded.push(await normalizeAttachment(f, 'local-' + Math.random().toString(36).slice(2, 8), nowIso, ownerId));
    }
    return uploaded;
  }

  for (const f of files) {
    // Already an uploaded Attachment -> pass through untouched.
    if (!(f instanceof File) && (f as Attachment).id) {
      uploaded.push(f as Attachment);
      continue;
    }

    // A local preview without raw bytes cannot reach Storage — keep its data URL.
    const rawFile = resolveSourceFile(f);
    if (!rawFile) {
      uploaded.push(await normalizeAttachment(f, 'local-' + Math.random().toString(36).slice(2, 8), nowIso, ownerId));
      continue;
    }

    try {
      const safeName = sanitizeAttachmentName(rawFile.name);
      const path = `uploads/${ownerId}/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(path, rawFile, { upsert: false, contentType: rawFile.type || 'application/octet-stream' });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
      const url = pub?.publicUrl || '';
      uploaded.push(toAttachment(rawFile, 'att_' + Math.random().toString(36).slice(2, 10), url, nowIso, ownerId));
    } catch (err: any) {
      // Storage unreachable -> degrade to an in-memory preview so the request still goes through.
      console.warn('Attachment upload failed, using local preview:', err?.message);
      uploaded.push(await normalizeAttachment(f, 'local-' + Math.random().toString(36).slice(2, 8), nowIso, ownerId));
    }
  }
  return uploaded;
}

async function normalizeAttachment(
  f: UploadableAttachment,
  id: string,
  uploadedAt: string,
  uploadedBy: string,
): Promise<Attachment> {
  if (f instanceof File) {
    return toAttachment(f, id, await fileToDataUrl(f), uploadedAt, uploadedBy);
  }
  const rawFile = (f as { file?: File }).file;
  if (rawFile) {
    return toAttachment(rawFile, id, (f as any).url || await fileToDataUrl(rawFile), uploadedAt, uploadedBy);
  }
  // Local preview object (name/size/type/url) — preserve its data URL.
  return {
    id,
    name: (f as any).name || 'attachment',
    size: (f as any).size || 0,
    type: (f as any).type || 'application/octet-stream',
    url: (f as any).url || '',
    uploadedAt,
    uploadedBy,
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function toAttachment(f: File, id: string, url: string, uploadedAt: string, uploadedBy: string): Attachment {
  return {
    id,
    name: f.name,
    size: f.size,
    type: f.type || 'application/octet-stream',
    url,
    uploadedAt,
    uploadedBy,
  };
}
