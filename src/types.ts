export type UserRole = 'client' | 'operator' | 'admin';

export type AppView = 'home' | 'auth' | 'app';

export type PageId =
  | 'dashboard'
  | 'support'
  | 'holding'
  | 'all-requests'
  | 'clients'
  | 'analytics'
  | 'rbac'
  | 'audit-logs'
  | 'notifications'
  | 'settings';

export interface User {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
  phoneNumber?: string;
  currency?: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  account?: string;
  ifsc?: string;
  bank?: string;
  estimatedHoldingBalance?: number;
  holdingAccountId?: string;
}

export type RequestType = 'support' | 'deposit' | 'withdraw';
export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Attachment {
  id: string;
  name: string;
  size: number; // bytes
  type: string;
  url: string; // Base64 data or preview URL
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  isInternal: boolean; // Only visible to operator and admin
  createdAt: string;
  attachments?: Attachment[];
}

export interface BaseRequest {
  id: string;
  ticketNumber: string; // e.g. TCK-2026-001 or HLD-2026-042
  type: RequestType;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  deleteRequested?: boolean;
  deleteRequestedBy?: string;
  deleteRequestedById?: string;
  deleteRequestedReason?: string;
  deleteRequestedAt?: string;
  comments: Comment[];
  attachments: Attachment[];
}

export interface SupportTicket extends BaseRequest {
  type: 'support';
  category: 'matm' | 'morpho' | 'passbook_printer' | 'new_setup' | 'upgrade_services';
  remoteId?: string;
  browserInfo?: string;
}

export interface HoldingDepositRequest extends BaseRequest {
  type: 'deposit';
  amount: number;
  currency: string;
  depositMethod: 'bank_deposit' | 'imps' | 'upi';
  transactionReferenceId: string; // Proof tx id or bank ref
  senderAccountName?: string;
  depositDate: string;
  verifiedTransactionId?: string; // Operator confirmation ref
}

export interface CmaStatus {
  configure?: boolean;
  configuredAt?: string;
  configuredBy?: string;
  make?: boolean;
  madeAt?: string;
  madeBy?: string;
  authorize?: boolean;
  authorizedAt?: string;
  authorizedBy?: string;
  authorizedAmount?: number;
}

export interface HoldingWithdrawRequest extends BaseRequest {
  type: 'withdraw';
  amount: number;
  currency: string;
  withdrawMethod: 'bank_wire' | 'sepa' | 'crypto_usdt' | 'crypto_btc' | 'other';
  beneficiaryAccountName: string;
  beneficiaryAccountNumberOrAddress: string;
  bankNameOrNetwork?: string;
  swiftOrIban?: string;
  reason?: string;
  transferReceiptRef?: string;
  cmaStatus?: CmaStatus;
  authorizedAmount?: number;
}

export type ServiceRequest = SupportTicket | HoldingDepositRequest | HoldingWithdrawRequest;

export interface RolePermissions {
  role: UserRole;
  allowedPages: PageId[];
  canCreateRequest: boolean;
  canChangeStatus: boolean;
  canAssignOperator: boolean;
  canAddInternalNotes: boolean;
  canViewAllClients: boolean;
  canManageRoles: boolean;
  canExportReports: boolean;
  canViewAuditLogs: boolean;
}

export interface Notification {
  id: string;
  userId: string; // Target user or 'all_operators' | 'all_admins'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'request_update' | 'assignment' | 'new_request' | 'system' | 'mention';
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. 'CREATED_REQUEST', 'UPDATED_STATUS', 'ASSIGNED_OPERATOR', 'MODIFIED_RBAC'
  targetType: 'request' | 'user' | 'rbac' | 'system';
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface FilterState {
  searchQuery: string;
  typeFilter: 'all' | RequestType;
  statusFilter: 'all' | RequestStatus | 'pending_deletion';
  priorityFilter: 'all' | RequestPriority;
  operatorFilter: 'all' | string;
  dateRange: 'all' | 'today' | '7d' | '30d' | '90d';
  clientId?: string;
}

